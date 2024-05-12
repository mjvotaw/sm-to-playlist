import React from "react";
import { TrackSelector } from "./TrackSelector";
import { TrackSet } from "../types/Track";
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { List, ListRowProps } from 'react-virtualized/dist/commonjs/List';
import { Box } from "@mui/material";

export interface TrackListProps
{
    trackSets: TrackSet[];
    isLoadingSongs: boolean;
    updateSelectedTrack: (trackSetIdx: number, trackIdx: number) => void;
  removeTrackSet: (trackSetIdx: number) => void;
};

export const TrackList: React.FC<TrackListProps> = ({trackSets, isLoadingSongs, updateSelectedTrack, removeTrackSet}) =>
{
    

    const renderRow = (props: ListRowProps) =>
    {
        return (
            <div key={props.index} style={props.style}>
                <Box padding={1}>
            <TrackSelector
                idx={props.index}
                trackSet={trackSets[props.index]}
                updateSelectedTrack={updateSelectedTrack}
                removeTrackSet={removeTrackSet}
                    />
                </Box>
            </div>
        )
    };

    return (
        
        <div className="track-list">
            <AutoSizer>
                {
                    ({ width, height }) => (
                        <List
                            width={width}
                            height={height}
                            rowHeight={234}
                            rowRenderer={renderRow}
                            rowCount={trackSets.length}
                            overscanRowCount={3}
                        />
                    )
                }
                </AutoSizer>
        </div>
    );

};