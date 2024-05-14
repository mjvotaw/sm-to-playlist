import React from "react";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, CircularProgress, Button, Grid, Paper, Stack, Divider, FormControlLabel, Checkbox, Box, LinearProgress, Backdrop, IconButton } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import GitHub  from "@mui/icons-material/GitHub";
import { Playlist } from "@spotify/web-api-ts-sdk";
import { SmSongInfo, getSampleSongs } from "./types/SmFile";
import { Track, TrackSet } from './types/Track';
import { useSpotifySearch } from "./search/SpotifySearch";
import { SmFileDropZone } from "./components/SmFileDropZone";
import { CreatePlaylistPopup } from "./components/CreatePlaylistPopup";
import { AudioPlayerProvider } from "./components/AudioPlayer";
import { TrackList } from "./components/TrackList";
import { InfoDialog } from "./components/InfoDialog";
import SpotifyLogo from './assets/images/Spotify_Logo_RGB_Green.png';


const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App()
{
  const search = useSpotifySearch();
  
  const [trackSets, setTrackSets] = React.useState<TrackSet[]>([]);
  const [songQueue, setSongQueue] = React.useState<SmSongInfo[]>([]);
  const [isProcessingSong, setIsProcessingSong] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isLoadingSongs, setIsLoadingSongs] = React.useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = React.useState<number>(0);

  const [showCreatePlaylist, setShowCreatePlaylist] = React.useState<boolean>(false);
  const [playlistName, setPlaylistName] = React.useState<string>("");

  const [includeTranslit, setIncludeTranslit] = React.useState<boolean>(true);
  const [includeCovers, setIncludeCovers] = React.useState<boolean>(true);

  const [playlist, setPlaylist] = React.useState<Playlist | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [showInitialLoad, setShowInitialLoad] = React.useState<boolean>(true);
  
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  // On initial load, check if we are already authenticated, or if we
  // need to deal with a redirect code.
  React.useEffect(() =>
  { 
    const checkAuthentication = async () =>
    {
      let isSpotifyAuthenticated = await search.isAuthenticated();
      if (isSpotifyAuthenticated)
      {
        console.log("isSpotifyAuthenticated = true");
        setIsAuthenticated(true);
      }
      else
      {
        const hashParams = new URLSearchParams(window.location.search);
        const code = hashParams.get("code");
        if (code)
        {
          console.log("we have a code");
          try
          {
            await search.authenticate();
            setIsAuthenticated(true);
          }
          catch (err)
          {
            console.log(err);
          }
        }
      }
      setShowInitialLoad(false);
    };

    checkAuthentication();
  }, []);


  React.useEffect(() =>
  { 
    if (isProcessingSong || isLoadingSongs || trackSets.length == 0)
    {
      return;
    }
    
    let songInfos = trackSets.map(t => t.songInfo);
    setIsLoadingSongs(true);
    setTrackSets([]);
    setSongQueue(songInfos);
    
  }, [includeTranslit, includeCovers]);
  
  React.useEffect(() =>
  { 
    const processQueue = async () =>
    { 
      if (songQueue.length == 0)
      {
        setIsLoadingSongs(false);
        return;
      }
      if (isProcessingSong)
      {
        return;
      }
      setIsProcessingSong(true);
      const song = songQueue[0];

      try
      {

        // Check to make sure this song isn't already loaded.
        // Sometimes simfiles will contain both .sm and .ssc files for compatibility reasons,
        // and we don't want to load the same song twice.

        let alreadyExists: boolean = false;
        for (let trackSet of trackSets)
        {
          if (trackSet.songInfo.equals(song)) 
          {
            alreadyExists = true;
            break;
          }
        }

        if (alreadyExists === false)
        {
          let tracks = await search.searchSong(song, includeTranslit, includeCovers);

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
            newTrackSets.sort((a, b) => a.songInfo.title!.localeCompare(b.songInfo.title!));
            return newTrackSets;
          });
          setPlaylistName(song.packName);
        }
      } catch (error)
      {
        console.log(`Error while loading song ${song.title}, `, error);
      }
      finally {
        setSongQueue((queue) => queue.slice(1));
        setIsProcessingSong(false);
        updateLoadingProgress();
      }
    };
    processQueue();
  }, [songQueue, isProcessingSong]);
  
  const handleAuth = async() => {
    await search.authenticate();
  }

  const updateLoadingProgress = () =>
  { 
    let progress = Math.round((trackSets.length / (trackSets.length + songQueue.length)) * 100);
    // Occassionally, trackSets.length and songQueue.length are both 0, 
    // which is honestly kind of unexpected. That probably means I'm not updating something correctly.
    if (!Number.isNaN(progress))
    {
      setLoadingProgress(progress);
    }
  };

  const onSongLoad = async (song: SmSongInfo) => {
    
    // force the loading bar to reset, since sometimes updateLoadingProgess() will fail
    if (isLoadingSongs == false) 
    {
      setLoadingProgress(0);
    }
    else
    {
      updateLoadingProgress();
    }

    setIsLoadingSongs(true);
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
    setTrackSets((trackSets) =>
    { 
      let updatedTrackSets = [...trackSets];
      updatedTrackSets[trackSetIdx].selectedTrack = trackIdx;
      return updatedTrackSets;
    });
  }

  const loadSamples = () =>
  {
    setShowInfo(false);
    setTrackSets([]);
    let sampleSongs = getSampleSongs();
    setIsLoadingSongs(true);
    setSongQueue(sampleSongs);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AudioPlayerProvider>
      <CssBaseline />
      <Container maxWidth={false}>
          <div className="App">
            <Backdrop open={showInitialLoad} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1}}>
              <CircularProgress  />
            </Backdrop>
            <InfoDialog isOpen={showInfo} close={() => { setShowInfo(false); }} loadSamples={loadSamples} />
            <Box display="flex" flexGrow={1} position="fixed" >
              <IconButton title="Info" onClick={() => { setShowInfo(true); }}>
                <InfoIcon />
              </IconButton>
              <IconButton href="https://github.com/mjvotaw/sm-to-playlist" target="_blank" title="View this project on Github">
                <GitHub />
                </IconButton>
            </Box>
            
            <Paper variant="outlined" style={{marginLeft: "auto", marginRight: "auto", alignSelf: "center"}}>
              {
                isAuthenticated ?
                    <Stack>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <SmFileDropZone onSongLoad={onSongLoad} />

                        
                        <Box sx={{ width: '80%', paddingBottom: '20px' }}>
                          {isLoadingSongs && (
                            <div>
                            <LinearProgress variant="determinate" value={loadingProgress} /> 
                              <span>{trackSets.length}  of {trackSets.length + songQueue.length}</span>
                              </div>
                          )}
                          </Box>
                        </Box>
                    <Divider />
                    <Box display="flex" gap="8px" sx={{ p: 1 }}>
                      <FormControlLabel checked={includeTranslit} control={<Checkbox value={includeTranslit} onChange={() => { setIncludeTranslit(!includeTranslit); }} />} label="Include 
                      transliterated titles and artists" />
                        <FormControlLabel checked={includeCovers} control={<Checkbox value={includeCovers} onChange={() => { setIncludeCovers(!includeCovers); }} />} label="Include song remixes/covers" />
                    </Box>
                  </Stack>
                  :
                  <Grid container display="flex" justifyContent="center" alignItems="center" sx={{ p: 4, width: "100%" }}>
                    <Grid display="flex" justifyContent="center" alignItems="center" flexDirection="column" textAlign="center">
                      <h3>This app needs to access your Spotify account in order to search for content and create playlists.</h3>
                      <Button variant="contained" onClick={() => { handleAuth(); }}>Yes, you can connect to my Spotify account</Button>
                    </Grid>
                  </Grid>
              }
            </Paper>
            
          <Divider orientation="vertical" flexItem />
          <div className="track-list-container">
              <Box display="flex" justifyContent="space-between" ><h3>Track List ({trackSets.length} Songs):</h3> <img src={SpotifyLogo} style={{objectFit:"contain", width:95}} /></Box>
              <TrackList trackSets={trackSets} isLoadingSongs={isLoadingSongs} updateSelectedTrack={updateSelectedTrack} removeTrackSet={handleRemoveTrackSet} />
            <Button variant="contained" size="large" disabled={trackSets.length == 0 || isLoadingSongs} onClick={() => { setShowCreatePlaylist(true); }}>Make Playlist!</Button>
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
        </AudioPlayerProvider>
    </ThemeProvider>
  );
}

export default App;
