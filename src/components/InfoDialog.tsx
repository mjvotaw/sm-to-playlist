import React from "react";
import { Box, Divider, Link, Pagination, Button } from "@mui/material";
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DropzoneImage from '../assets/images/dropzone.png';
import RightResultsImage from '../assets/images/right-results.png';
import WrongResultsImage from '../assets/images/wrong-results.png';
import NoResultsImage from '../assets/images/no-results.png';
import MakePlaylistImage from '../assets/images/make-playlist.png';
import PlaylistSuccessImage from '../assets/images/make-playlist-success.png';

export interface InfoDialogProps
{
    isOpen: boolean;
    close: () => void;
    loadSamples: () => void;
}

const pages:InfoDialogPageProps[] = [
    {
        title: "What is this?",
        description: (<div>
            <p>sm-to-playlist is an app to help you build <Link href="https://spotify.com" target="_blank">Spotify</Link> playlists from <Link href="https://en.wikipedia.org/wiki/StepMania" target="_blank">Stepmania</Link> simfile packs.</p>
            <p>The tl; dr is: <ul>
                <li>First, allow this application access to your Spotify account</li>
                <li>The, drag a folder of simfiles into the spot where it says "drag a simfile pack folder onto here!".</li>
                    <li>The section to the right will populate with results from Spotify, with the best match for each song selected.</li>
                    <li>Double check the list to make sure there aren't any obvious mis-matches</li>
                    <li>then click "Make Playlist" to add the playlist to your Spotify account.</li>
            </ul>
            </p>
            <p>Click "Next" below for a more detailed description, or click "Load Sample Songs" if you just want to see how this works.</p>
        </div>),
        imageUrl: null
    },
    {
        title: "Loading Songs",
        description: (<div>
            <p>Drag a folder onto the upload icon, and sm-to-playlist will start loading any .sm or .ssc files found. It reads the '#TITLE' and '#ARTIST' tags your simfiles, and searches Spotify for matching songs.</p>
            <p>At the bottom, there are a few options that you can change to alter the results:
                <ul>
                    <li><strong>Include transliterated titles and artists</strong> - sm-to-playlist will include results for the transliterated song titles and artist names.</li>
                    <li><strong>Include song remixes/covers</strong> - sm-to-playlist will include songs that have a matching name, but not a matching artist. </li>
                </ul>
            </p>
        </div>),
        imageUrl: DropzoneImage
    },
    {
        title: "Selecting Matching Songs",
        description: (<div>
            <p>sm-to-playlist tries to find the best matches from Spotify's results, and provides you with a few options for each song. It's a good idea to check through the playlist to fix/remove any bad matches.</p>
        </div>),
        imageUrl: RightResultsImage
    },
    {
        title: "Selecting Matching Songs (cont'd)",
        description: (<div>
            <p>Sometimes, there aren't any matching songs :C</p>
            <p></p>
        </div>),
        imageUrl: NoResultsImage
    },
    {
        title: "Selecting Matching Songs (cont'd)",
        description: (<div>
            <p>Sometimes, the matched songs are just wrong. If that's the case, then click the 'x' in the right-hand corner to remove it from your playlist.</p>
        </div>),
        imageUrl: WrongResultsImage
    },
    {
        title: "Creating the Playlist",
        description: (<div>
            <p>When you're happy with the playlist, click "Make Playlist". This will open a new dialog for you to confirm the playlist name, and select whether or not to make the playlist private (they are private by default).</p>
        </div>),
        imageUrl: MakePlaylistImage
    },
    {
        title: "Creating the Playlist (cont'd)",
        description: (<div>
            <p>Once the playlist is created, you'll be presented with a url to the playlist.</p>
        </div>),
        imageUrl: PlaylistSuccessImage
    },
]

export const InfoDialog: React.FC<InfoDialogProps> = ({isOpen, close, loadSamples}) =>
{
    const [pageIdx, setPageIdx] = React.useState<number>(0);

    const thing = () =>
    {
        return (
            <div></div>
        )
    }
    const prev = () =>
    { 
        if (pageIdx > 0)
        {
            setPageIdx(pageIdx - 1);
        }
    };
    const next = () =>
    {
        if (pageIdx < pages.length - 1)
        {
            setPageIdx(pageIdx + 1);    
        }
    }
    return (
        <Dialog open={isOpen}
            onClose={close}
            maxWidth="md"
            fullWidth={true}
        >
            <DialogContent>
                <InfoDialogPage {...pages[pageIdx]} />
                <Divider />
            </DialogContent>
            <Box display="flex" padding={1} justifyContent="flex-end">
                <Box marginRight="auto"><Button onClick={loadSamples} >Load Sample Songs</Button></Box>
                <Button onClick={prev}>Prev</Button>
                <Pagination count={pages.length} page={pageIdx + 1} onChange={(event, page) => { setPageIdx(page - 1); }} />
                <Button onClick={next}>Next</Button>
            </Box>
        </Dialog>
    );
};
 

interface InfoDialogPageProps
{
    title: string;
    description: JSX.Element;
    imageUrl: string | null;
};
const InfoDialogPage: React.FC<InfoDialogPageProps> = ({ title, description, imageUrl }) =>
{
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <h3>{title}</h3>
            {imageUrl && (
                <Box padding={2} bgcolor="#121212" width="60%">
                    <img src={imageUrl} style={{ objectFit: "contain", width: "100%", }} />
                    </Box>
            )}
            <Box paddingLeft={2} paddingRight={2}>
                {description}
            </Box>
        </Box>
    )
}