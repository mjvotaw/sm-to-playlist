import React from 'react';
import { Track, TrackSet } from '../types/Track';
import Carousel from 'react-material-ui-carousel'
import { TrackDisplayItem } from './TrackDisplayItem';
import { SmSongInfo } from '../types/SmFile';
import CancelIcon from '@mui/icons-material/Cancel';
import { Paper } from '@mui/material';

export interface TrackSelectorProps
{
    trackSet: TrackSet;
    idx: number;
    updateSelectedTrack: (trackSetIdx: number, trackIdx: number) => void;
    removeTrackSet: (trackSetIdx: number) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({ trackSet, idx, updateSelectedTrack, removeTrackSet }) =>
{ 
    
    return (
        <Paper>
                <div className="track-selector">
                <p>Results for {trackSet.songInfo.title}:</p>
                {
                    trackSet.tracks.length === 0 && (
                        <TrackDisplayItem track={undefined} songInfo={trackSet.songInfo} />
                    )
                }
                {trackSet.tracks.length > 0 && (
                    <Carousel
                        navButtonsAlwaysVisible={true}
                        autoPlay={false}
                        index={trackSet.selectedTrack}
                        onChange={(now, previous) =>
                        {
                            if (now)
                            {
                                updateSelectedTrack(idx, now);
                            }
                         }}
                    >
                        {trackSet.tracks.map((t, i) => <TrackDisplayItem key={i} track={t} songInfo={trackSet.songInfo} />)}
                    </Carousel>
                )}
                <div className="close-button" onClick={() => { removeTrackSet(idx) }}>
                <CancelIcon />
                </div>
        </div>
            </Paper>    
    );
};
