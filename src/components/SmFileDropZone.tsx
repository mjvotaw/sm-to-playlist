import React, {useCallback} from 'react'
import Dropzone, {useDropzone, FileRejection, DropEvent, Accept} from 'react-dropzone'
import { Paper, CircularProgress } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SmSongInfo } from '../types/SmFile';

export interface FileDropZoneProps 
{
    onSongLoad: (song: SmSongInfo) => void;
}

export const SmFileDropZone: React.FC<FileDropZoneProps> = ({onSongLoad}) =>
{
    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({ accept: { "text/plain": [".sm", ".ssc"] } });
    
    const onDrop = async (
        acceptedFiles: File[],
        fileRejections: FileRejection[],
        event: DropEvent
    ) =>
    {
        // Apparently the 'accept' prop for useDropzone doesn't work right, and it will return
        // pretty much any text file, so weed out anything that's not a simfile.
        let simfiles: File[] = acceptedFiles.filter((f) => f.name.endsWith(".sm") || f.name.endsWith(".ssc"));

        for (let file of simfiles)
        { 
            if (!file.name.endsWith(".sm") && !file.name.endsWith(".ssc"))
            {
                continue;
            }
            let song = await readFileContents(file);
            if (song)
            {
                onSongLoad(song);
            }

        }
    };

    const readFileContents = async (file: File): Promise<SmSongInfo> =>
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader()

            reader.onabort = () => { reject('file reading was aborted'); }
            reader.onerror = () => { reject('file reading has failed'); }

            reader.onload = () => {
            
                const smContents = reader.result;
                if (smContents == null || typeof smContents != 'string')
                {
                    reject('file read didnt end up as a string somehow');
                }
                const smLines = (smContents as string).split(/\r?\n/);

                let song: SmSongInfo = new SmSongInfo();
                song.filepath = file.webkitRelativePath;
                song.packName = file.webkitRelativePath.split("/")[0] || "";
                
                for (let line of smLines)
                {
                    if (line.startsWith("#ARTISTTRANSLIT:"))
                    {
                        song.artistTranslit = getMdfValue(line);
                    }
                    else if (line.startsWith("#ARTIST:"))
                    {
                        song.artist = getMdfValue(line);    
                    }
                    else if (line.startsWith("#TITLETRANSLIT:"))
                    {
                        song.titleTranslit = getMdfValue(line);    
                    }
                    else if (line.startsWith("#TITLE:"))
                    {
                        song.title = getMdfValue(line);    
                    }
                    else if (line.startsWith("#SUBTITLETRANSLIT:"))
                    {
                        song.subtitleTranslit = getMdfValue(line);    
                    }
                    else if (line.startsWith("#SUBTITLE:"))
                    {
                        song.subtitle = getMdfValue(line);    
                    }
                    else if (line.startsWith("#NOTES")) // if we hit #NOTES, then we're past all of the song data
                    {
                        break;    
                    }
                }
                if (song.titleTranslit != null && (song.title == null || song.title == ""))
                {
                    song.title = song.titleTranslit;
                }
                if (song.artistTranslit != null && (song.artist == null || song.artist == ""))
                {
                    song.artist = song.artistTranslit;    
                }

                if (song.title == null)
                {
                    console.log(`${file.name} has no song title??`);    
                    reject(`${file.name} has no song title??`);
                    return;
                }

                resolve(song);
            }
            reader.readAsText(file)
        });
    };

    const getMdfValue = (line: string): string | null =>
    {
        const mdfRegex = /^#(\w+):(.+?);$/
        const match = line.match(mdfRegex);
        if (match)
        {
            const value = match[2];
            return value;
        }
        return null;
    };

    return (
        <Dropzone accept={{"text/plain": [".sm", ".ssc"]}}  onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
                    <div className="drop-zone-content" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>Drag a simfile pack folder onto here!</p>
                        <CloudUploadIcon sx={{ fontSize: 60 }} />
                    </div>
            )}
        </Dropzone>
    )
};