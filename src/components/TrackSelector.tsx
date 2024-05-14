import React from "react";
import { Track, TrackSet } from "../types/Track";
import { TrackDisplayItem } from "./TrackDisplayItem";
import { SmSongInfo } from "../types/SmFile";
import CancelIcon from "@mui/icons-material/Cancel";
import { Stack, Pagination, Paper, Box, Typography } from "@mui/material";
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
      <Box position="relative" display="flex" flexDirection="column" alignItems="center" padding={2}>

        <Typography variant="body2" alignSelf="flex-start"
          title={`Results for ${trackSet.songInfo.title} ${trackSet.songInfo.subtitle}`}
          style={{ overflow: "hidden", textOverflow: "ellipsis", textWrap: "nowrap", maxWidth: "90%" }}>
          Results for {trackSet.songInfo.title} {trackSet.songInfo.subtitle}
        </Typography>
        <Typography variant="body2" alignSelf="flex-start">
          by {trackSet.songInfo.artist}:
        </Typography>

        
          {trackSet.tracks.length === 0 && (
            <TrackDisplayItem track={undefined} songInfo={trackSet.songInfo} />
          )}
          {trackSet.tracks.length > 0 && (
            <TrackDisplayItem
              track={trackSet.tracks[trackSet.selectedTrack]}
              songInfo={trackSet.songInfo}
            />
          )}


          <Pagination count={trackSet.tracks.length} page={trackSet.selectedTrack + 1} size="small" onChange={(event, page) => { handleUpdateSelectedTrack(page - 1); }} />

          <div
          className="close-button"
          onClick={() => {
            handleRemoveTrackSet();
          }}
          title={`Remove ${trackSet.songInfo.title} from playlist`}
        >
          <CancelIcon />
        </div>
        </Box>
    </Paper>
  );
};
