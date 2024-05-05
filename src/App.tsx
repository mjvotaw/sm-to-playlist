import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./App.css";
import { Container, Grid, Stack } from "@mui/material";
import { Track, SpotifySearch } from "./search/SpotifySearch";
import Carousel from 'react-material-ui-carousel';
import { TrackDisplayItem } from "./components/TrackDisplayItem";
import { SmFileDropZone } from "./components/SmFileDropZone";
import { SmSongInfo } from "./types/SmFile";
import { TrackSelector } from "./components/TrackSelector";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App()
{
  const search = new SpotifySearch();
  const [displayTracks, setDisplayTracks] = React.useState<{ tracks: Track[], songInfo: SmSongInfo }[]>([]);
  const [songQueue, setSongQueue] = React.useState<SmSongInfo[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
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

        setDisplayTracks((displayTracks) =>
        {
          let newDisplayTracks = [
            ...displayTracks,
            {
              tracks: tracks,
              songInfo: song
            }
          ];
          return newDisplayTracks;
        });
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

    for (let trackSet of displayTracks)
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth={false}>
        <div className="App">
          <SmFileDropZone onSongLoad={onSongLoad} />
          
          <div className="track-list">
              {displayTracks.map((t, i) => 
              <TrackSelector key={i} tracks={t.tracks} songInfo={t.songInfo} />
              )}
            </div>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
