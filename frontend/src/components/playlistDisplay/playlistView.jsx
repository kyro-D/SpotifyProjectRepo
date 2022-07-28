import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const handlePlaylistClick = (showPlaylistDetails, setShowPlaylistDetails) => {
  setShowPlaylistDetails(!showPlaylistDetails);
};

const getPlaylistTracks = async (url, setTracks, navigate) => {
  let endpoint = "/playlist-tracks";
  let params = new URLSearchParams();
  let gotAllTracks = false;
  let allTracks = [];
  while (!gotAllTracks) {
    params.set("url", url);
    let endpointFinal = endpoint + "?" + params.toString();
    try {
      let currentTracks = await axios.get(endpointFinal).catch((err) => {
        console.log(err);
      });
      //if there is error on backend, code after this won't get executed due to axios error handling (I think)
      allTracks.push(currentTracks.data.items);

      if (currentTracks.data.next === null) {
        gotAllTracks = true;
      } else {
        url = currentTracks.data.next;
      }
    } catch (error) {
      console.error("error occured: ", error);
      if (error.response.status === 401) {
        navigate("/error");
      }
    }
  }

  setTracks(allTracks);
};

function PlaylistView({ index, playlist }) {
  const [showPlaylistDetails, setShowPlaylistDetails] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState(null);
  const [error, setError] = useState(false);

  let navigate = useNavigate();
  useEffect(() => {
    getPlaylistTracks(playlist.tracks.href, setPlaylistTracks, navigate);
  }, [playlist.tracks.href]);

  let trackCounter = 0;

  return (
    <div className="playlist-entry" key={index}>
      <div
        className="playlist-entry-image-wrapper"
        onClick={() =>
          handlePlaylistClick(showPlaylistDetails, setShowPlaylistDetails)
        }
      >
        <img src={playlist.images[0].url} alt="playlist cover" />
      </div>
      <div
        className="playlist-entry-title"
        onClick={() =>
          handlePlaylistClick(showPlaylistDetails, setShowPlaylistDetails)
        }
      >
        {playlist.name}
      </div>
      {showPlaylistDetails && (
        <div className="playlist-entry-details">
          <div className="entry-detail">
            {playlist.public === true ? "Public" : "Private"}
          </div>
          <div className="entry-detail-tracks">
            <div>Tracks: </div>
            {playlistTracks.map((trackArr, index) => {
              return trackArr.map((track, index) => {
                trackCounter += 1;

                return (
                  <div className="track-listing" key={index}>
                    {" "}
                    {trackCounter}. {track.track.name}{" "}
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaylistView;
