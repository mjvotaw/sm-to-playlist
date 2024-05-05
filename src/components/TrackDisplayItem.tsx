import React from "react";
import { Track } from "../search/SpotifySearch";
import { Grid, Paper } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

export const TrackDisplayItem: React.FC<{ track: Track, loading: boolean }> = ({ track, loading }) =>
{
    return (
        <div className={`track-item ${loading ? "loading": ""}`}>
            <Paper variant="outlined">
                <div className="track-content">
                    <div
                        className="track-image"
                        style={{ backgroundImage: `url(${track.imageUrl})` }}
                    >
                        {!track.imageUrl && <MusicNoteIcon sx={{ fontSize: 60 }} />}
                    </div>
                    <div className="track-info">
                        <p className="track-title-wrapper">
                            <span className="track-title">{track.name}</span>
                        </p>
                        <p className="track-title-wrapper">
                            <span className="track-title">{track.artist}</span>
                        </p>
                    </div>
                    <PlayCircleIcon fontSize="large"/>
                </div>
            </Paper>
        </div>
    );
};
