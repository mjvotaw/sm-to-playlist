import React from 'react';
import { Track } from '../search/SpotifySearch';
import Carousel from 'react-material-ui-carousel'
import { TrackDisplayItem } from './TrackDisplayItem';


export const TrackSelector: React.FC<{ tracks: Track[] }> = ({ tracks }) =>
{ 
    
    return (
        <Carousel
            navButtonsAlwaysVisible={true}
            autoPlay={false}
        >
            {tracks.map((t, i) => <TrackDisplayItem key={i} track={t} loading={false} />)}
        </Carousel>
    );
};
