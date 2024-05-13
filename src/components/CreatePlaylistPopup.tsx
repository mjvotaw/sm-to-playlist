import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, TextField, FormControl, FormControlLabel, FormGroup, FormLabel, Paper, InputBase, IconButton, Box } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Playlist } from "@spotify/web-api-ts-sdk";

export interface CreatePlaylistPopupProps
{
    playlistName: string;
    isPrivate: boolean;
    open: boolean;
    onCancel: () => void;
    onCreate: (playlistName: string, isPrivate: boolean) => void;
    playlist: Playlist | null;
    loading: boolean;
}

export const CreatePlaylistPopup: React.FC<CreatePlaylistPopupProps> = ({ playlistName: initialPlaylistName, isPrivate: initialIsPrivate, open, onCancel, onCreate, playlist, loading }) =>
{ 
    const [playlistName, setPlaylistName] = React.useState<string>(initialPlaylistName);
    const [isPrivate, setIsPrivate] = React.useState<boolean>(initialIsPrivate);
    const playlistTextRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() =>
    { 
        setPlaylistName(initialPlaylistName);
    }, [initialPlaylistName]);
    const handleOnCreate = () =>
    {
        if (playlistName.length > 0)
        {
            onCreate(playlistName, isPrivate);    
        }
    }

    const handleCopy = () =>
    { 
        playlistTextRef.current?.select();
        document.execCommand('copy');
    };
    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth={true}
        >
            <DialogTitle>Create Playlist</DialogTitle>
            {playlist && (
                <DialogContent>
                    <h3>Success!</h3>
                    <Paper
                    component="form"
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                    >
                        <InputBase style={{flexGrow: 1}} value={playlist.external_urls.spotify} inputRef={playlistTextRef} />
                        <IconButton style={{marginLeft: "auto"}} onClick={handleCopy} title="Copy URL">
                            <ContentCopyIcon />
                        </IconButton>
                    </Paper>
                </DialogContent>
                )}
                {!playlist && (
                <DialogContent>
                    <Box display="flex" flexDirection="column">
                    <FormControl>
                        <FormLabel>Playlist Name:</FormLabel>
                        <TextField  variant="outlined" value={playlistName}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            { 
                                setPlaylistName(event.target.value);
                                }} />
                    </FormControl>
                    <FormGroup>
                        <FormControlLabel checked={isPrivate} control={<Checkbox value={isPrivate} onChange={() => { setIsPrivate(!isPrivate);  }} />}  label="Make Playlist Private"/>
                    </FormGroup>
                    </Box>
                </DialogContent>
            )}
            {playlist && (
                <DialogActions>
                <Button onClick={onCancel}>Close</Button>
            </DialogActions>
            )}
            {!playlist && (
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={handleOnCreate} disabled={playlistName.length == 0} >Create!</Button>
            </DialogActions>
            )}
        </Dialog>
    );
};