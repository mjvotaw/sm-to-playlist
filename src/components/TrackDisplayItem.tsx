import React from "react";
import { Track } from "../types/Track";
import { Box, CircularProgress, Paper, Link, IconButton } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { SmSongInfo } from "../types/SmFile";
import { ScrollingText } from "./ScrollingText";
import { useAudioPlayer } from "./AudioPlayer";

export const TrackDisplayItem: React.FC<{
  track?: Track;
  songInfo: SmSongInfo;
}> = ({ track, songInfo }) => {
  const audioPlayer = useAudioPlayer();

  const handlePlay = () => {
    if (track && track.previewAudioUrl) {
      audioPlayer.setUrl(track.previewAudioUrl);
      audioPlayer.play();
    }
  };
  const handleStop = () => {
    audioPlayer.stop();
  };
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
              <ScrollingText>
                <Link href={track.link} target="_blank">{track.name}</Link>
              </ScrollingText>
              <ScrollingText>
                <Box display="flex" gap="6px">
                  {track.artists.map((artist, idx) =>
                  { 
                    return (
                      <Link href={artist.link ?? ""} target="_blank" key={idx}>{artist.name}</Link>
                    )
                  })}
                </Box>
              </ScrollingText>
            </div>
            <Box sx={{ position: "relative", display: "flex", alignItems: "center",
                  justifyContent: "center", }}>
              <CircularProgress
                variant="determinate"
                size={35}
                value={audioPlayer.currentUrl == track.previewAudioUrl ? audioPlayer.progress : 0}
                color="success"
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {audioPlayer.currentUrl == track.previewAudioUrl &&
                  audioPlayer.isPlaying ? (
                    <IconButton onClick={handleStop}>
                      <PauseCircleIcon fontSize="large"  />
                      </IconButton>
                ) : (
                    <IconButton onClick={handlePlay}>
                      <PlayCircleIcon fontSize="large" />
                    </IconButton>
                )}
              </Box>
            </Box>
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
              <ScrollingText>
                <span>{songInfo.title ?? ""}</span>
                </ScrollingText>
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
};
