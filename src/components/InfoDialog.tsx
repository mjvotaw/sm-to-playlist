import React from "react";
import { Box, Divider, Pagination } from "@mui/material";
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

export interface InfoDialogProps
{
    isOpen: boolean;
    close: () => void;
}

const pages:InfoDialogPageProps[] = [
    {
        title: "What is this?",
        description: (<p>sm-to-playlist is an app to help you build a Spotify playlist for a simfile pack.
            
        </p>),
        imageUrl: null
    }
]

export const InfoDialog: React.FC<InfoDialogProps> = ({isOpen, close}) =>
{
    const [pageIdx, setPageIdx] = React.useState<number>(0);

    const thing = () =>
    {
        return (
            <div></div>
        )
    }
    return (
        <Dialog open={isOpen} onClose={close}>
            <DialogContent>
                <InfoDialogPage {...pages[pageIdx]} />
                <Divider />
                <Pagination count={pages.length} page={pageIdx + 1} onChange={(event, page) => { setPageIdx(page - 1); }} />
            </DialogContent>
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
            {description}
        </Box>
    )
}