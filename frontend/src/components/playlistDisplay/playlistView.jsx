import {useEffect, useState} from 'react';
import axios from 'axios';

const handlePlaylistClick = (showPlaylistDetails, setShowPlaylistDetails) => {
    setShowPlaylistDetails(!showPlaylistDetails);
    
}

const getPlaylistTracks = async (userId, url, setTracks) => {
    
    let endpoint = "/playlist-tracks";
    let params = new URLSearchParams();
    params.append('userId', userId);
    let gotAllTracks = false;
    let allTracks = [];
    console.log('looping through tracks on client')
    while(!gotAllTracks){

        params.set('url', url);
        let endpointFinal = endpoint + '?' + params.toString();
        
        
        let currentTracks = await axios.get(endpointFinal);
        //if there is error on backend, code after this won't get executed due to axios error handling (I think)
        allTracks.push(currentTracks.data.items);

        if(currentTracks.data.next === null){
            gotAllTracks = true;
        }
        else{
            url = currentTracks.data.next;
        }

    }
    
    setTracks(allTracks);
}


function PlaylistView({index, playlist, userId}){
    const [showPlaylistDetails, setShowPlaylistDetails] = useState(false);
    const [playlistTracks, setPlaylistTracks] = useState(null);

    useEffect(()=> {
        if(userId !== null){
            getPlaylistTracks(userId, playlist.tracks.href, setPlaylistTracks)
        }
        
    }, [userId, playlist.tracks.href]);

    let trackCounter = 0;

    return(
        <div className="playlist-entry" key={index} >
            <div className="playlist-entry-image-wrapper" onClick={() => handlePlaylistClick(showPlaylistDetails, setShowPlaylistDetails)}>
                <img src={playlist.images[0].url} alt="playlist cover"/>
            </div>
            <div className="playlist-entry-title" onClick={() => handlePlaylistClick(showPlaylistDetails, setShowPlaylistDetails)}>
                {playlist.name}
            </div>
            {showPlaylistDetails &&
                <div className="playlist-entry-details">
                    <div className="entry-detail">{playlist.public ===   true ? 'Public' : 'Private'}</div>
                    <div className="entry-detail-tracks">
                        <div>Tracks: </div>
                        { playlistTracks.map((trackArr, index) => {

                            return (trackArr.map((track, index) => {
                                trackCounter += 1;
                                
                                return (
                                    <div className="track-listing" key={index}> {trackCounter}) {track.track.name} </div>
                                )
                            })

                            )
                        })     
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default PlaylistView;
