import { AuthorizationCodeWithPKCEStrategy, Playlist, SpotifyApi, Track as SpotifyTrack, TrackItem } from '@spotify/web-api-ts-sdk';
import gestaltSimilarity from "gestalt-pattern-matcher";
import { SmSongInfo } from '../types/SmFile';
import { Track } from '../types/Track';
import React from 'react';

const client_id:string = process.env.REACT_APP_SPOTIFY_CLIENT_ID ?? "";
const redirect_url:string = process.env.REACT_APP_SPOTIFY_REDIRECT ?? "";

export class SpotifySearch
{

    api: SpotifyApi;

    private WHOLE_SCORE_WEIGHT = 0.2;
    private FULL_TITLE_WEIGHT = 1.0;
    private JUST_TITLE_WEIGHT = 0.2;
    private ARTIST_WEIGHT = 1.0;

    private searchCache: { [id: string]: Track[] } = {};

    private common_sm_words = [
        "(No CMOD)",
        /^\[\d+\]/,
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

    
    
    async searchSong(song: SmSongInfo, includeTranslit: boolean, scoreCutoff: number = 1.3, maxCount: number = 10): Promise<Track[]>
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

        tracks = tracks.sort((a, b) =>
        { 
            return b.similarityScore - a.similarityScore
        });

        let filteredTracks = tracks.filter((t) => t.similarityScore > scoreCutoff);
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
        // and reorganize the artist info so that the artists are listed alphabetically
        title = this.stripCommonSMWords(title);
        subtitle = this.stripCommonSMWords(subtitle);
        artist = this.splitArtist(artist).join(" ");

        let maybeCachedResults = this.getCachedResults(title, subtitle, artist);
        if (maybeCachedResults)
        {
            return maybeCachedResults;
        }
        let results = await this.api.search(`${title} ${subtitle}, ${artist}`, ["track"]);
        let spottracks = results.tracks.items;

        let tracks = spottracks.map((track) =>
        {
            let imageUrl = track.album.images.length > 0 ? track.album.images[0].url : null;
            let artists = track.artists.map(a => { return { name: a.name, link: a.external_urls.spotify }; });
            let [titleScore, artistScore] = this.scoreTrack(track, title, subtitle, artist);

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

        this.setCachedResults(title, subtitle, artist, tracks);
        return tracks;
    }

    private scoreTrack(track: SpotifyTrack, searched_title: string, searched_subtitle: string, searched_artist: string): [number, number]
    {
        let item_title = track.name;
        let item_artist = track.artists.map(a => a.name).join(" ");
        return this.score(item_title, item_artist, searched_title, searched_subtitle, searched_artist);
    }

    // Determining a match score is slightly delicate
    private score(item_title: string, item_artist: string, searched_title: string, searched_subtitle: string, searched_artist: string): [number, number]
    {
        item_title = item_title.toLowerCase();
        item_artist = item_artist.toLowerCase();
        searched_title = searched_title.toLowerCase();
        searched_subtitle = searched_subtitle.toLowerCase();
        searched_artist = searched_artist.toLowerCase();

        let full_title = `${searched_title} ${searched_subtitle}`.trim();

        let trackScore = gestaltSimilarity(item_title, full_title) * this.FULL_TITLE_WEIGHT;
        let artistScore = gestaltSimilarity(item_artist, searched_artist) * this.ARTIST_WEIGHT;

        if (searched_subtitle.length > 0)
        {
            trackScore += gestaltSimilarity(item_title, searched_title) * this.JUST_TITLE_WEIGHT;    
        }
        return [trackScore, artistScore];
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
    
    private splitArtist(artist: string): string[]
    {
        // An "artist" tag might actually be several artists ("Srezcat [feat. blaxervant & Shinonome I/F]")
        // in order to get meaningful genres, we need to split this up into multiple artist names
        let originalArtist = artist;
        let separators = [" & ", " + ", " feat. ", " feat ", " ft. ", "vs. ", " vs ", ", ", " + ", " x "];
        let replacement_separator = "----";
        artist = artist.replace("(", "").replace(")", "").replace("[", "").replace("]", "");
        artist = artist.toLowerCase();

        for (let sep in separators)
        {
            artist = artist.replaceAll(sep, replacement_separator);
        }

        let split_artists = artist.split(replacement_separator);
        if (split_artists.length == 0)
        {
            return [originalArtist];
        }
        split_artists.sort((a, b) => a.localeCompare(b));
        return split_artists;
    }
}

const api = new SpotifySearch();

export function useSpotifySearch()
{
    return api;
}