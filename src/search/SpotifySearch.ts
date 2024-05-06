import { AuthorizationCodeWithPKCEStrategy, Playlist, SpotifyApi, Track as SpotifyTrack, TrackItem } from '@spotify/web-api-ts-sdk';
import gestaltSimilarity from "gestalt-pattern-matcher";
import { SmSongInfo } from '../types/SmFile';
import { Track } from '../types/Track';
import React from 'react';

const client_id = "4872953cacaa437d9e7f5393df0ef2dd";
const redirect_url = 'http://localhost:3000';


export class SpotifySearch
{

    api: SpotifyApi;

    private WHOLE_SCORE_WEIGHT = 0.2;
    private TITLE_WEIGHT = 1.0;
    private ARTIST_WEIGHT = 1.0;
     _isAuthenticated: boolean = false;
    constructor()
    {
        const auth = new AuthorizationCodeWithPKCEStrategy(client_id, redirect_url, ["playlist-read-private",
            "playlist-read-collaborative",
            "playlist-modify-private",
            "playlist-modify-public",]);
        
        this.api = new SpotifyApi(auth);
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
        }
    }

    isAuthenticated(): boolean
    {
        return this._isAuthenticated;
    }
    
    async searchSong(song: SmSongInfo, includeTranslit: boolean, scoreCutoff: number = 0.5, maxCount: number = 10): Promise<Track[]>
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
        if (filteredTracks.length === 0)
        {
            tracks = tracks.slice(0, 5);
        }
        else
        {
            tracks = filteredTracks.slice(0, maxCount);    
        }

        return tracks;
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
                uri: track.uri,

            };
            return t;
        });

        return tracks;
    }

    private scoreTrack(track: SpotifyTrack, searched_title: string, searched_subtitle: string, searched_artist: string): number
    {
        let item_title = track.name;
        let item_artist = track.artists.map(a => a.name).join(", ");
        return this.score(item_title, item_artist, searched_title, searched_subtitle, searched_artist);
    }

    private score(item_title: string, item_artist: string, searched_title: string, searched_subtitle: string, searched_artist: string): number
    {
        let wholeScore = gestaltSimilarity(`${item_title} ${item_artist}`, `${searched_title} ${searched_subtitle} ${searched_artist}`);
        let trackScore = gestaltSimilarity(item_title, searched_title);
        let artistScore = gestaltSimilarity(item_artist, searched_artist);
        return (wholeScore * this.WHOLE_SCORE_WEIGHT) + (trackScore * this.TITLE_WEIGHT) + (artistScore * this.ARTIST_WEIGHT);
    }

    chunkTracks(tracks:Track[], size: number): Track[][] {
        const chunks: Track[][] = [];
        while (tracks.length > 0) {
            chunks.push(tracks.splice(0, size));
        }
        return chunks;
    }
}

export function useSpotifySearch()
{
    const [api, setApi] = React.useState<SpotifySearch>(new SpotifySearch());
    return api;
}