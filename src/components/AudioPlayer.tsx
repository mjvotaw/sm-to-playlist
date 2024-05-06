import React, { useContext } from "react";

export type AudioPlayerContextType = {
    setUrl: (url: string) => void;
    play: () => void;
    stop: () => void;
    isPlaying: boolean;
    progress: number;
    currentUrl: string | undefined;
}

const AudioPlayerContext = React.createContext<AudioPlayerContextType | undefined>(undefined);
interface AudioPlayerProps
{
    children: React.ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProps> = (props) =>
{ 
    const [url, _setUrl] = React.useState<string | undefined>();
    const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
    const [progress, setProgress] = React.useState<number>(0);

    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const setUrl = (url: string) => {
        _setUrl(url);
        if (audioRef.current)
        {
            audioRef.current.src = url;
        }
    };

    const play = () =>
    {
        setIsPlaying(true);
        setProgress(0);
        audioRef.current?.play().catch((err) =>
        { 
            console.log("Error playing audio: ", err);
        });
    }
    const stop = () =>
    {
        setIsPlaying(false);
        setProgress(0);
        audioRef.current?.pause();
    }

    React.useEffect(() =>
    { 
        if (audioRef.current)
        {
            audioRef.current.volume = 0.4;
            
            audioRef.current.ontimeupdate = (event) =>
            {
                if (audioRef.current)
                {
                    let currentTime = audioRef.current.currentTime;
                    let totalTime = audioRef.current.duration;
                    setProgress(Math.round( (currentTime / totalTime) * 100));
                }
            };
            audioRef.current.onended = () =>
            { 
                setProgress(0);
                setIsPlaying(false);
            };

            audioRef.current.onpause = () =>
            {
                setIsPlaying(false);
                setProgress(0);
            }
            return () =>
            {
                if (audioRef.current)
                {
                    audioRef.current.ontimeupdate = null;
                }
            }
        }
    }, [audioRef]);

    const contextValue: AudioPlayerContextType = {
        setUrl: setUrl,
        play: play,
        stop: stop,
        isPlaying: isPlaying,
        progress: progress,
        currentUrl: url,

    }

    return (
        <AudioPlayerContext.Provider value={contextValue}>
            {props.children}
            <audio ref={audioRef} ></audio>
        </AudioPlayerContext.Provider>
    )
};

export const useAudioPlayer = (): AudioPlayerContextType =>
{
    const context = useContext(AudioPlayerContext);
    if (!context)
    {
        throw new Error("useAudioPlayer must be used within a AudioPlayerProvider");    
    }
    return context;
}