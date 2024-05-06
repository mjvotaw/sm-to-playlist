import React from "react";
import { Track, TrackSet } from "../types/Track";
import { TrackDisplayItem } from "./TrackDisplayItem";
import { SmSongInfo } from "../types/SmFile";
import CancelIcon from "@mui/icons-material/Cancel";
import { Stack, Pagination, Paper } from "@mui/material";


export interface TrackSelectorProps {
  trackSet: TrackSet;
  idx: number;
  updateSelectedTrack: (trackSetIdx: number, trackIdx: number) => void;
  removeTrackSet: (trackSetIdx: number) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  trackSet,
  idx,
  updateSelectedTrack,
  removeTrackSet,
}) => {
  const onTrackLeft = () => {
    if (trackSet.selectedTrack > 0) {
      updateSelectedTrack(idx, trackSet.selectedTrack - 1);
    } else {
      updateSelectedTrack(idx, trackSet.tracks.length - 1);
    }
  };

  const onTrackRight = () => {
    if (trackSet.selectedTrack < trackSet.tracks.length - 1) {
      updateSelectedTrack(idx, trackSet.selectedTrack + 1);
    } else {
      updateSelectedTrack(idx, 0);
    }
  };

  return (
    <Paper>
      <div className="track-selector">
        <p>Results for "{trackSet.songInfo.title} {trackSet.songInfo.subtitle}", by {trackSet.songInfo.artist}:</p>

        
          {trackSet.tracks.length === 0 && (
            <TrackDisplayItem track={undefined} songInfo={trackSet.songInfo} />
          )}
          {trackSet.tracks.length > 0 && (
            <TrackDisplayItem
              track={trackSet.tracks[trackSet.selectedTrack]}
              songInfo={trackSet.songInfo}
            />
          )}


          <Pagination count={trackSet.tracks.length} page={trackSet.selectedTrack + 1} onChange={(event, page) => { updateSelectedTrack(idx, page - 1); }} />

          <div
          className="close-button"
          onClick={() => {
            removeTrackSet(idx);
          }}
        >
          <CancelIcon />
        </div>
      </div>
    </Paper>
  );
};
