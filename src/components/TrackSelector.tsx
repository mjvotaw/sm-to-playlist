import React from "react";
import { Track, TrackSet } from "../types/Track";
import { TrackDisplayItem } from "./TrackDisplayItem";
import { SmSongInfo } from "../types/SmFile";
import CancelIcon from "@mui/icons-material/Cancel";
import { Stack, Pagination, Paper } from "@mui/material";
import { useAudioPlayer } from "./AudioPlayer";


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
}) =>
{
  
  const audioPlayer = useAudioPlayer();


  const handleUpdateSelectedTrack = (page: number) =>
  { 
    if (audioPlayer.isPlaying && audioPlayer.currentUrl == trackSet.tracks[trackSet.selectedTrack].previewAudioUrl)
    {
      audioPlayer.stop();
    }
    updateSelectedTrack(idx, page);
  };

  const handleRemoveTrackSet = () =>
  { 
    if (audioPlayer.isPlaying && audioPlayer.currentUrl == trackSet.tracks[trackSet.selectedTrack].previewAudioUrl)
      {
        audioPlayer.stop();
    }
    removeTrackSet(idx);
  }
  

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


          <Pagination count={trackSet.tracks.length} page={trackSet.selectedTrack + 1} onChange={(event, page) => { handleUpdateSelectedTrack(page - 1); }} />

          <div
          className="close-button"
          onClick={() => {
            handleRemoveTrackSet();
          }}
        >
          <CancelIcon />
        </div>
      </div>
    </Paper>
  );
};
