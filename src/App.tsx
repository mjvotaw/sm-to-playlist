import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./App.css";
import { Container, CircularProgress, Button } from "@mui/material";
import { SpotifySearch } from "./search/SpotifySearch";
import { SmFileDropZone } from "./components/SmFileDropZone";
import { SmSongInfo } from "./types/SmFile";
import { TrackSelector } from "./components/TrackSelector";
import { CreatePlaylistPopup } from "./components/CreatePlaylistPopup";
import { Playlist } from "@spotify/web-api-ts-sdk";
import { Track, TrackSet } from './types/Track';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App()
{
  const search = new SpotifySearch();
  const [trackSets, setTrackSets] = React.useState<TrackSet[]>([]);
  const [songQueue, setSongQueue] = React.useState<SmSongInfo[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = React.useState<boolean>(false);
  const [playlistName, setPlaylistName] = React.useState<string>("");

  const [playlist, setPlaylist] = React.useState<Playlist | null>(null);

  React.useEffect(() =>
  { 
    const processQueue = async () =>
    { 
      if (songQueue.length == 0)
      {
        setIsLoading(false);
        return;
      }
      if (isProcessing)
      {
        return;
      }
      setIsProcessing(true);
      const song = songQueue[0];

      try
      {
        let tracks = await search.searchSong(song, true);

        setTrackSets((trackSets) =>
        {
          let newTrackSets = [
            ...trackSets,
            {
              tracks: tracks,
              songInfo: song,
              selectedTrack: 0,
            }
          ];
          return newTrackSets;
        });
        setPlaylistName(song.packName);
      } catch (error)
      {
        console.log(`Error while loading song ${song.title}, `, error);
      }
      finally {
        setSongQueue((queue) => queue.slice(1));
        setIsProcessing(false);
      }
    };
    processQueue();
  }, [songQueue, isProcessing]);
  
  const onSongLoad = async (song: SmSongInfo) => {

    for (let trackSet of trackSets)
    {
      if (trackSet.songInfo.equals(song)) // did we already load this song? then quit.
      {
        return;
      }
    }
    setIsLoading(true);
    setSongQueue((queue) =>
    { 
      return [...queue, song];
    });
  };

  const handleCreatePlaylist = async (playlistName: string, isPrivate: boolean) =>
  { 
    setIsLoading(true);
    let selectedTracks: Track[] = [];
    for (let trackSet of trackSets)
    {
      if (trackSet.tracks.length > 0)
      {
        selectedTracks.push(trackSet.tracks[trackSet.selectedTrack]);  
      }
    }
    let playlist = await search.createPlaylist(playlistName, isPrivate, selectedTracks);

    setPlaylist(playlist);
    setIsLoading(false);
    
  };

  const handleRemoveTrackSet = (trackSetIdx: number) =>
  { 
    let updatedTrackSets = [...trackSets];
    updatedTrackSets.splice(trackSetIdx, 1);
    setTrackSets(updatedTrackSets);
  };

  const updateSelectedTrack = (trackSetIdx: number, trackIdx: number) =>
  {
    console.log(`updating trackSet ${trackSetIdx} selected track: ${trackIdx}`);

    setTrackSets((trackSets) =>
    { 
      let updatedTrackSets = [...trackSets];
      updatedTrackSets[trackSetIdx].selectedTrack = trackIdx;
      return updatedTrackSets;
    });
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth={false}>
        <div className="App">
          <SmFileDropZone onSongLoad={onSongLoad} />
          
          <div className="track-list-container">
            <h3>Track List: </h3>
          <div className="track-list">
              {trackSets.map((t, i) => 
                <TrackSelector key={i} idx={i} trackSet={t} updateSelectedTrack={ updateSelectedTrack} removeTrackSet={handleRemoveTrackSet} />
              )}
            </div>
            <Button variant="contained" size="large" disabled={trackSets.length == 0} onClick={() => { setShowCreatePlaylist(true); }}>Make Playlist!</Button>
          </div>

          <CreatePlaylistPopup open={showCreatePlaylist}
            playlistName={playlistName}
            isPrivate={true}
            onCancel={() => { setShowCreatePlaylist(false); }}
            onCreate={handleCreatePlaylist}
            playlist={playlist}
            loading={isLoading}
          />
          </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
