import { SmSongInfo } from "./SmFile";


export interface Track
{
    name: string;
    link: string;
    artist: string;
    artists: {
        name: string;
        link: string | null;
    }[];
    similarityScore: number;
    artistSimilarityScore: number;
    titleSimilarityScore: number;
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