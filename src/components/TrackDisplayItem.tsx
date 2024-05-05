import React from "react";
import { Track } from "../types/Track";
import { Paper } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { SmSongInfo } from "../types/SmFile";
import { ScrollingText } from "./ScrollingText";

export const TrackDisplayItem: React.FC<{
  track?: Track;
  songInfo: SmSongInfo;
}> = ({ track, songInfo }) => {
  return (
    <div className="track-item">
      <Paper variant="outlined">
        {track && (
          <div className="track-content">
            <div
              className="track-image"
              style={{ backgroundImage: `url(${track.imageUrl})` }}
            >
              {!track.imageUrl && <MusicNoteIcon sx={{ fontSize: 60 }} />}
            </div>
            <div className="track-info">
              <ScrollingText text={track.name} />
              <ScrollingText text={track.artist} />
            </div>
            <PlayCircleIcon fontSize="large" />
          </div>
        )}
        {!track && (
          <div className="track-content">
          <div className="track-image">
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60 }} />
          </div>
          <div className="track-info">
            <p className="track-title-wrapper">
              <span className="track-title">No songs found for</span>
              </p>
              <ScrollingText text={songInfo.title ?? ""} />
          </div>
          
        </div>
        )}
      </Paper>
    </div>
  );
};
