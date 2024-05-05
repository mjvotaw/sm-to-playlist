import { SpotifyApi, Track as SpotifyTrack } from '@spotify/web-api-ts-sdk';
import gestaltSimilarity from "gestalt-pattern-matcher";
import { SmSongInfo } from '../types/SmFile';

const client_id = "4872953cacaa437d9e7f5393df0ef2dd";
const redirect_url = 'http://localhost:3000';

export interface Track
{
    name: string;
    artist: string;
    similarityScore: number;
    previewAudioUrl: string | null;
    popularityStore: number;
    duration: number;
    imageUrl: string | null;
    
};


export class SpotifySearch
{

    api: SpotifyApi;

    private WHOLE_SCORE_WEIGHT = 0.2;
    private TITLE_WEIGHT = 1.0;
    private ARTIST_WEIGHT = 0.5;

    constructor()
    {
        this.api = SpotifyApi.withUserAuthorization(client_id, redirect_url, ["playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",]);
    }
    
    async searchSong(song: SmSongInfo, includeTranslit: boolean, scoreCutoff: number = 0.5): Promise<Track[]>
    {
        if (song.title === null || song.artist === null)
        {
            return [];    
        }
        let tracks: Track[] = await this.search(song.title, song.subtitle ?? "", song.artist, scoreCutoff);

        if (includeTranslit && (song.titleTranslit != null || song.artistTranslit != null))
        {
            let title = song.titleTranslit ?? song.title;
            let subtitle = song.subtitleTranslit ?? song.subtitle ?? "";
            let artist = song.artistTranslit ?? song.artist;

            let tracksTranslist = await this.search(title, subtitle, artist, scoreCutoff);
            tracks = [
                ...tracks,
                ...tracksTranslist
            ];
        }
        return tracks;
    }

    private async search(title: string, subtitle: string, artist: string, scoreCutoff: number): Promise<Track[]>
    {
        let results = await this.api.search(`${title} ${subtitle}, ${artist}`, ["track"]);
        let spottracks = results.tracks.items;

        let tracks = spottracks.map((track) =>
        {
            let imageUrl = track.album.images.length > 0 ? track.album.images[0].url : null;
            let t: Track = {
                name: track.name,
                artist: track.artists.map(a => a.name).join(", "),
                similarityScore: this.scoreTrack(track, title, subtitle, artist),
                popularityStore: track.popularity,
                previewAudioUrl: track.preview_url,
                duration: track.duration_ms,
                imageUrl: imageUrl,

            };
            return t;
        });

        tracks = tracks.sort((a, b) =>
        { 
            return b.similarityScore - a.similarityScore
        });
        let filteredTracks = tracks.filter((t) => t.similarityScore > scoreCutoff);
        if (filteredTracks.length === 0)
        {
            tracks = tracks.slice(0, 5);
        }
        else
        {
            tracks = filteredTracks;    
        }

        return tracks;
    }

    scoreTrack(track: SpotifyTrack, searched_title: string, searched_subtitle: string, searched_artist: string): number
    {
        let item_title = track.name;
        let item_artist = track.artists.map(a => a.name).join(", ");
        return this.score(item_title, item_artist, searched_title, searched_subtitle, searched_artist);
    }

    score(item_title: string, item_artist: string, searched_title: string, searched_subtitle: string, searched_artist: string): number
    {
        // let wholeScore = gestaltSimilarity(`${item_title} ${item_artist}`, `${searched_title} ${searched_subtitle} ${searched_artist}`);
        let trackScore = gestaltSimilarity(item_title, searched_title);
        let artistScore = gestaltSimilarity(item_artist, searched_artist);
        return (trackScore * this.TITLE_WEIGHT) + (artistScore * this.ARTIST_WEIGHT);
    }
}