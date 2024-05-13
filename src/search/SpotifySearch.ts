import { AuthorizationCodeWithPKCEStrategy, Playlist, SpotifyApi, Track as SpotifyTrack, TrackItem } from '@spotify/web-api-ts-sdk';
import gestaltSimilarity from "gestalt-pattern-matcher";
import { SmSongInfo } from '../types/SmFile';
import { Track } from '../types/Track';

const client_id:string = process.env.REACT_APP_SPOTIFY_CLIENT_ID ?? "";
const redirect_url:string = process.env.REACT_APP_SPOTIFY_REDIRECT ?? "";

export class SpotifySearch
{

    api: SpotifyApi;

    private FULL_TITLE_WEIGHT = 1.0;
    private NO_SUBTITLE_WEIGHT = 0.3;
    private ALL_ARTISTS_WEIGHT = 1.0;
    private MAIN_ARTIST_WEIGHT = 0.5;

    private MAX_COUNT = 10;
    private MIN_SCORE_CUTOFF = 0.8;
    private MIN_TITLE_CUTOFF = 0.3;
    private MIN_ARTIST_CUTOFF = 0.7;
    private NEARLY_PERFECT_MATCH = 1.95;

    private searchCache: { [id: string]: Track[] } = {};

    private common_sm_words = [
        "(No CMOD)",
        /^\[[\w\d]+?\]/,
    ];

     _isAuthenticated: boolean = false;
    constructor()
    {
        const auth = new AuthorizationCodeWithPKCEStrategy(client_id, redirect_url, ["playlist-read-private",
            "playlist-read-collaborative",
            "playlist-modify-private",
            "playlist-modify-public",]);
        
        this.api = new SpotifyApi(auth);
        (window as any)["gestaltSimilarity"] = gestaltSimilarity;
    }

    async authenticate()
    {
        try
        {
            await this.api.authenticate();
            this._isAuthenticated = true;
        } catch (error)
        {
            console.log("Error while trying to authenticate:", error);
            throw error;
        }
    }

    async isAuthenticated(): Promise<boolean>
    {
        return (await this.api.getAccessToken()) != null;
    }

    
    
    async searchSong(song: SmSongInfo, includeTranslit: boolean, includeCovers: boolean): Promise<Track[]>
    {
        if (song.title === null || song.artist === null)
        {
            return [];
        }
        let tracks: Track[] = await this.search(song.title, song.subtitle ?? "", song.artist);

        if (includeTranslit && (song.titleTranslit != null || song.artistTranslit != null))
        {
            let title = song.titleTranslit ?? song.title;
            let subtitle = song.subtitleTranslit ?? song.subtitle ?? "";
            let artist = song.artistTranslit ?? song.artist;

            let tracksTranslist = await this.search(title, subtitle, artist,);
            tracks = [
                ...tracks,
                ...tracksTranslist
            ];
        }

        let filteredTracks = this.filterTracks(tracks, includeCovers);
        return filteredTracks;
    }

    async createPlaylist(playlistName: string, isPrivate: boolean, tracks: Track[]): Promise<Playlist<TrackItem>>
    {
        let user = await this.api.currentUser.profile();

        let track_chunks = this.chunkTracks(tracks, 100);
        let playlist = await this.api.playlists.createPlaylist(user.id, { name: playlistName, public: !isPrivate });
        for (let chunk of track_chunks)
        {
            let uris = chunk.map((t) => t.uri);
            await this.api.playlists.addItemsToPlaylist(playlist.id, uris);    
        }

        playlist = await this.api.playlists.getPlaylist(playlist.id);
        return playlist;   
    }

    private async search(title: string, subtitle: string, artist: string): Promise<Track[]>
    {
        // Strip out some things that are only useful in Stepmania,
        // and split artists to remove delimeters
        title = this.stripCommonSMWords(title);
        subtitle = this.stripCommonSMWords(subtitle);
        let search_artists = this.splitArtist(artist);
        let joined_artists = search_artists.join(" ");

        let maybeCachedResults = this.getCachedResults(title, subtitle, joined_artists);
        if (maybeCachedResults)
        {
            return maybeCachedResults;
        }
        let results = await this.api.search(`${title} ${subtitle}, ${joined_artists}`, ["track"]);
        let spottracks = results.tracks.items;

        let tracks = spottracks.map((track) =>
        {
            let [titleScore, artistScore] = this.scoreTrack(track, title, subtitle, search_artists);
            let imageUrl = track.album.images.length > 0 ? track.album.images[0].url : null;
            let artists = track.artists.map(a => { return { name: a.name, link: a.external_urls.spotify }; });

            let t: Track = {
                name: track.name,
                link: track.external_urls.spotify,
                artist: track.artists.map(a => a.name).join(", "),
                artists: artists,
                similarityScore: titleScore + artistScore,
                artistSimilarityScore: artistScore,
                titleSimilarityScore: titleScore,
                popularityStore: track.popularity,
                previewAudioUrl: track.preview_url,
                duration: track.duration_ms,
                imageUrl: imageUrl,
                uri: track.uri,

            };
            return t;
        });

        this.setCachedResults(title, subtitle, joined_artists, tracks);
        return tracks;
    }

    private scoreTrack(track: SpotifyTrack, searched_title: string, searched_subtitle: string, searched_artists: string[]): [number, number]
    {
        let item_title = track.name;
        let item_artists = track.artists.map(a => a.name);
        return this.score(item_title, item_artists, searched_title, searched_subtitle, searched_artists);
    }

    // Determining a match score is slightly delicate. We don't want to throw out songs that
    // are a good enough match, such as alternate versions of the song by the same main artist,
    // or covers/remixes, while still removing songs that definitely aren't a good match, 
    // such as songs that just happen to have the same name, or unrelated songs from the same artist.
    //
    // Currently, this takes several similarity scores into consideration:
    // - a "full title" score: the item's title compared to the simfile's title + subtitle
    // - a "just title" score: if the simfile has a subtitle, compare the item title to just the simfile's title.
    //   This is weighted to provide only a very slight boost to the title score.
    // - an "all artists" score: All of the item's artists compared to the simfile's artists.
    //   Both lists are sorted alphabetically and joined into a string with a single space " " delimiter.
    // - a "just main artist" score: Takes the first artist from both lists and compares them.
    //   this is weighted to provide a 50% boost to the artist score.
    //
    // As it stands right now, a perfect score would be
    // FULL_TITLE_WEIGHT +  ALL_ARTISTS_WEIGHT + MAIN_ARTIST_WEIGHT = 2.5
    // or for songs that have a subtitle
    // FULL_TITLE_WEIGHT + JUST_TITLE_WEIGHT + ALL_ARTISTS_WEIGHT + MAIN_ARTIST_WEIGHT = 2.8

    private score(item_title: string, item_artists: string[], searched_title: string, searched_subtitle: string, searched_artists: string[]): [number, number]
    {
        item_title = item_title.toLowerCase();
        item_artists = item_artists.map(a => a.toLowerCase());
        searched_title = searched_title.toLowerCase();
        searched_subtitle = searched_subtitle.toLowerCase();
        searched_artists = searched_artists.map(a => a.toLowerCase());

        
        let joined_item_artists = item_artists.toSorted((a, b) => a.localeCompare(b)).join(" ");
        let joined_search_artists = searched_artists.toSorted((a, b) => a.localeCompare(b)).join(" ");

        let full_title = `${searched_title} ${searched_subtitle}`.trim();

        let fullTitleScore = gestaltSimilarity(item_title, full_title) * this.FULL_TITLE_WEIGHT;
        let allArtistScore = gestaltSimilarity(joined_item_artists, joined_search_artists) * this.ALL_ARTISTS_WEIGHT;
        let mainArtistScore = gestaltSimilarity(item_artists[0], searched_artists[0]) * this.MAIN_ARTIST_WEIGHT;

        let justTitleScore = 0;
        if (searched_subtitle.length > 0)
        {
            justTitleScore += gestaltSimilarity(item_title, searched_title) * this.NO_SUBTITLE_WEIGHT;    
        }

        let artistScore = allArtistScore + mainArtistScore;
        let titleScore = fullTitleScore + justTitleScore;
        return [titleScore, artistScore];
    }

    private chunkTracks(tracks:Track[], size: number): Track[][] {
        const chunks: Track[][] = [];
        while (tracks.length > 0) {
            chunks.push(tracks.splice(0, size));
        }
        return chunks;
    }

    private getCachedResults(title: string, subtitle: string, artist: string): Track[] | undefined
    {
        let cacheKey = `${title}|${subtitle}|${artist}`;
        return this.searchCache[cacheKey];
    }

    private setCachedResults(title: string, subtitle: string, artist: string, tracks: Track[])
    {
        let cacheKey = `${title}|${subtitle}|${artist}`;
        this.searchCache[cacheKey] = tracks;
    }

    private stripCommonSMWords(str: string): string 
    {
        let stripped_str = str;

        for (let word of this.common_sm_words)
        {
            stripped_str = stripped_str.replace(word, "");
        }

        return stripped_str.trim();
    }
    
    // An "artist" tag might actually be several artists ("Srezcat [feat. blaxervant & Shinonome I/F]")
    // We need to split this up into multiple artist names so that we can provide a better search query
    // and to provide more accurate scoring.
    // We don't sort this list here, because we want to preserve the order of the artists,
    // the assumption being that the first artist is the main artist of the song.
    private splitArtist(artist: string): string[]
    {
        
        let originalArtist = artist;
        let separators = [" & ", " + ", " feat. ", " feat ", " ft. ", "vs. ", " vs ", ", ", " + ", " x "];
        let replacement_separator = "----";
        artist = artist.replace("(", "").replace(")", "").replace("[", "").replace("]", "");
        artist = artist.toLowerCase();

        for (let sep of separators)
        {
            artist = artist.replaceAll(sep, replacement_separator);
        }

        let split_artists = artist.split(replacement_separator);
        if (split_artists.length == 0)
        {
            return [originalArtist];
        }
        return split_artists;
    }

    // Much like scoring, filtering tracks can be difficult.
    // First, we have a bare minimum MIN_SCORE_CUTOFF, to remove tracks that are just way off base.
    // Then, we filter out songs that have a very poor title similarity.
    // These are usually tracks that match the artist exactly, but have a title isn't actually similar at all.
    // And then, if includeCovers == false, we want to remove tracks that don't meet some MIN_ARTIST_CUTOFF,
    // to remove tracks that probably just have the same name.
    // And finally, we cut the list down to at most MAX_COUNT tracks.
    // If we have any tracks that are over NEARLY_PERFECT_MATCH, then return even fewer results,
    // because the highest scoring track is almost certainly the correct one.
    // It's not really necessary, but it just makes the results look better.
    private filterTracks(tracks: Track[], includeCovers: boolean): Track[]
    {
        tracks = tracks.sort((a, b) =>
        { 
            return b.similarityScore - a.similarityScore
        });

        let filteredTracks = tracks.filter((t) => t.similarityScore > this.MIN_SCORE_CUTOFF);
        filteredTracks = filteredTracks.filter((t) => t.titleSimilarityScore > this.MIN_TITLE_CUTOFF);
        if (!includeCovers)
        {
            filteredTracks = filteredTracks.filter((t) => t.artistSimilarityScore > this.MIN_ARTIST_CUTOFF);
        }

        // If we have a track that is almost certainly an exact match, don't bother showing them a ton of options.
        if (filteredTracks.length > 0 && filteredTracks[0].similarityScore >= this.NEARLY_PERFECT_MATCH)
        {
            filteredTracks = filteredTracks.slice(0, this.MAX_COUNT / 2);    
        }
        else
        {
            filteredTracks = filteredTracks.slice(0, this.MAX_COUNT);
        }
        return filteredTracks;
    }
}

const api = new SpotifySearch();

export function useSpotifySearch()
{
    return api;
}