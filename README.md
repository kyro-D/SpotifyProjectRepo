# SpotifyProjectRepo
[Personal project](https://kdr-spotify.herokuapp.com/) using Spotify's web based APIs to show user their top artist and tracks. 
Currently hosting project on Heroku. 


# How to Develop Locally

First make sure the code is setup to be run locally and not for heroku deployment. All of the changes necessary for this can be seen in the following commit: [ef2866d3b411be473fab04e961c78584a3d6499b](https://github.com/kyro-D/SpotifyProjectRepo/commit/ef2866d3b411be473fab04e961c78584a3d6499b)

Navigate to `/backend` and run `npm start`

In order for frontend changes to be seen locally, you need to rebuild the frontend. This is because the application utilizes the built version of the app located in `/backend/build`. To rebuild the frontend navigate to `/frontend` and run `npm run build`. This will rebuild the frontend and put the built frontend application in the reqiured `/backend/build` directory. 

You can leave the backend code running. Refreshing the app in the browser will yeild the changes from the new build. 

