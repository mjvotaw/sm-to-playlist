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
    
    const [loading, setIsLoading] = React.useState<boolean>(false);
    const onDrop = async (
        acceptedFiles: File[],
        fileRejections: FileRejection[],
        event: DropEvent
    ) => {
        setIsLoading(true);

        for (let file of acceptedFiles)
        { 
            
            let song = await readFileContents(file);
            if (song)
            {
                onSongLoad(song);
            }

        }

        setIsLoading(false);
    };

    const readFileContents = async (file: File): Promise<SmSongInfo> =>
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader()

            reader.onabort = () => { reject('file reading was aborted'); }
            reader.onerror = () => { reject('file reading has failed'); }

            reader.onload = () => {
            // Do whatever you want with the file contents
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
        <div className="drop-zone-container">
            <Dropzone accept={{"text/plain": [".sm", ".ssc"]}}  onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <Paper variant="outlined">
                        <div className="drop-zone-content" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Drag a simfile pack folder onto here!</p>
                            <CloudUploadIcon sx={{ fontSize: 60 }} />
                            {loading && (
                                <CircularProgress />)}
                        </div>
                    </Paper>
                )}
            </Dropzone>
        </div>
    )
};