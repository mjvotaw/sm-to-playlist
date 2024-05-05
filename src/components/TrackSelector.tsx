import React from 'react';
import { Track } from '../search/SpotifySearch';
import Carousel from 'react-material-ui-carousel'
import { TrackDisplayItem } from './TrackDisplayItem';
import { SmSongInfo } from '../types/SmFile';
import CancelIcon from '@mui/icons-material/Cancel';
import { Paper } from '@mui/material';


export const TrackSelector: React.FC<{ tracks: Track[], songInfo: SmSongInfo }> = ({ tracks, songInfo }) =>
{ 
    
    return (
        <Paper>
                <div className="track-selector">
                <p>Results for {songInfo.title}:</p>
                {
                    tracks.length === 0 && (
                        <TrackDisplayItem track={undefined} songInfo={songInfo} />
                    )
                }
                {tracks.length > 0 && (
                    <Carousel
                        navButtonsAlwaysVisible={true}
                        autoPlay={false}
                    >
                        {tracks.map((t, i) => <TrackDisplayItem key={i} track={t} songInfo={songInfo} />)}
                    </Carousel>
                )}
                <div className="close-button">
                <CancelIcon />
                </div>
        </div>
            </Paper>    
    );
};
