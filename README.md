# SpotifyProjectRepo

[Personal project](https://kdr-spotify.herokuapp.com/) using Spotify's web based APIs to show user their top artist and tracks.
Currently hosting project on Heroku.

# How to Develop Locally

Navigate to `/backend` and run `npm run start-local`

In order for frontend changes to be seen locally, you need to rebuild the frontend. This is because the application utilizes the built version of the app located in `/backend/build`. To rebuild the frontend navigate to `/frontend` and run `npm run build`. This will rebuild the frontend and put the built frontend application in the reqiured `/backend/build` directory.

You can leave the backend code running. Refreshing the app in the browser will yeild the changes from the new build.
