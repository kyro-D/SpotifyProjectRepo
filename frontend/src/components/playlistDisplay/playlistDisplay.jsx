import { useState } from "react";
import './index.css';
import PlaylistView from "./playlistView";



function PlaylistDisplay({playlistJson, userId}){

    const [currentPlaylists, setCurrentPlaylists] = useState(playlistJson);

    

    return(
        <div className="playlist-display-wrapper">
            {currentPlaylists && 
                currentPlaylists.items.map((playlist, index) => {
                    return (
                        <PlaylistView index={index} playlist={playlist} key={index} userId={userId} />
                    )
                })
            }
        </div>
        
    )
}

export default PlaylistDisplay;