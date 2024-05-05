import { SmSongInfo } from "./SmFile";

export interface Track
{
    name: string;
    artist: string;
    similarityScore: number;
    previewAudioUrl: string | null;
    popularityStore: number;
    duration: number;
    imageUrl: string | null;
    uri: string;
    
};

export interface TrackSet
{
    tracks: Track[];
    songInfo: SmSongInfo;
    selectedTrack: number;
}