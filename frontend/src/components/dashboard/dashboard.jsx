import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./index.css";
import PlaylistDisplay from "../playlistDisplay/playlistDisplay";

const pingBackendPlaylists = async (
  userId,
  setRequestStatus,
  setPlaylistJson
) => {
  let endpoint = "/playlists";
  let params = new URLSearchParams();
  params.append("userId", userId);
  endpoint += "?" + params.toString();
  console.log("frontend endpoint var: " + endpoint);
  let playlists = await axios.get(endpoint);
  //if there is error on backend, code after this won't get executed due to axios error handling (I think)
  setRequestStatus(true);
  setPlaylistJson(playlists.data);
};
//TODO: store the tokens in react context
function Dashboard() {
  const search = useLocation().search;
  const params = new URLSearchParams(search);
  const [userId, setUserId] = useState(params.get("userId"));
  const [requestStatus, setRequestStatus] = useState(false);
  const [showPlaylistDisplay, setShowPlaylistDisplay] = useState(false);
  const [playlistJson, setPlaylistJson] = useState();

  useEffect(() => {
    if (requestStatus) {
      //had successful request
      // seleclively render the playlist dashboard with state variable
      setShowPlaylistDisplay(true);
    }
  }, [requestStatus]);

  return (
    <div className="dashboard-wrapper">
      {!showPlaylistDisplay && (
        <button
          onClick={() => {
            setRequestStatus(false);
            pingBackendPlaylists(userId, setRequestStatus, setPlaylistJson);
          }}
        >
          List your playlists
        </button>
      )}
      {showPlaylistDisplay && (
        <div className="return-to-dashboard-btn">
          <button onClick={() => setShowPlaylistDisplay(!showPlaylistDisplay)}>
            {" "}
            &lt;- Return to dashboard
          </button>
        </div>
      )}
      {showPlaylistDisplay && (
        <PlaylistDisplay playlistJson={playlistJson} userId={userId} />
      )}
    </div>
  );
}

export default Dashboard;
