import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./App.css";
import { Container, Grid, Stack } from "@mui/material";
import { Track, SpotifySearch } from "./search/SpotifySearch";
import { TrackDisplayItem } from "./components/TrackDisplayItem";
import { TrackSelector } from "./components/TrackSelector";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  React.useEffect(() => {
    const doSearch = async () => {
      const search = new SpotifySearch();
      let tracks = await search.searchSong(
        "Plastic Love",
        "",
        "Mariya Takeuchi"
      );
      setTracks(tracks);
    };

    doSearch();
  }, []);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth={false}>
        <div className="App">
          <div className="track-list">
            <TrackSelector tracks={tracks} />
            </div>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
