import { SpotifyApi, Track as SpotifyTrack } from '@spotify/web-api-ts-sdk';
import gestaltSimilarity from "gestalt-pattern-matcher";

const client_id = "4872953cacaa437d9e7f5393df0ef2dd";
const client_secret = "c6ab6d2d2fe1473096e18b402bded8fd";


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

    private WHOLE_SCORE_WEIGHT = 1.0;
    private TITLE_WEIGHT = 1.0;
    private ARTIST_WEIGHT = 0.5;

    constructor()
    {
        this.api = SpotifyApi.withClientCredentials(client_id, client_secret, ["playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-private",
        "playlist-modify-public",]);
    }

    dumpApi()
    {
        console.log(this.api);
        console.log(this.api.search);
    }
    
    async searchSong(title: string, subtitle: string, artist: string): Promise<Track[]>
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
        let wholeScore = gestaltSimilarity(`${item_title} ${item_artist}`, `${searched_title} ${searched_subtitle} ${searched_artist}`);
        let trackScore = gestaltSimilarity(item_title, searched_title);
        let artistScore = gestaltSimilarity(item_artist, searched_artist);
        return (wholeScore * this.WHOLE_SCORE_WEIGHT) + (trackScore * this.TITLE_WEIGHT) + (artistScore * this.ARTIST_WEIGHT);
    }
}