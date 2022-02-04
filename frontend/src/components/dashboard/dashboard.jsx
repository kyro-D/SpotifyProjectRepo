import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import axios from 'axios';
import './index.css';
import PlaylistDisplay from '../playlistDisplay/playlistDisplay';

const pingBackendPlaylists = async (access_token, setRequestStatus, setPlaylistJson) => {
    let endpoint = "http://localhost:8888/playlists";
    let params = new URLSearchParams;
    params.append('access_token', access_token);
    endpoint += '?' + params.toString();
    
    let playlists = await axios.get(endpoint);
    //if there is error on backend, code after this won't get executed due to axios error handling (I think)
    setRequestStatus(true);
    setPlaylistJson(playlists.data);
}
//TODO: store the tokens in react context
function Dashboard(){
    const search = useLocation().search;
    const params = new URLSearchParams(search);
    const [access_token, setAccessToken] = useState(params.get("access_token"));
    const [requestStatus, setRequestStatus] = useState(false);
    const [showPlaylistDisplay, setShowPlaylistDisplay] = useState(false);
    const [playlistJson, setPlaylistJson] = useState();

    useEffect(()=> {
        if(requestStatus){
            //had successful request
            // seleclively render the playlist dashboard with state variable
            setShowPlaylistDisplay(true);
        }
    }, [requestStatus])
    
    const refresh_token = params.get("refresh_token");
    

    return(
        <div className="dashboard-wrapper">
            {!showPlaylistDisplay && <button  onClick={() => {
                setRequestStatus(false); 
                pingBackendPlaylists(access_token, setRequestStatus, setPlaylistJson);
                }}
            > 
                List your playlists
            </button>}
            {showPlaylistDisplay && 
             <div className="return-to-dashboard-btn">
                <button onClick={()=> setShowPlaylistDisplay(!showPlaylistDisplay)}> &lt;- Return to dashboard</button>
             </div>
            }
            {showPlaylistDisplay && <PlaylistDisplay playlistJson={playlistJson} access_token={access_token}/>}
        </div>
    )
}

export default Dashboard;