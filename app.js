/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const path = require('path');

//require('dotenv').config({path:"kyleproject.env"});

//var client_id = process.env.SPOTIFYCLIENTID; // Your client id
//var client_secret = process.env.SPOTIFYCLIENTSECRET; // Your secret

//Client ID and secret for Heroku to access
var client_id = process.env.SpotifyClientId;
var client_secret = process.env.SpotifyClinetSecret;
var port = process.env.PORT;
var host = process.env.HOST

//var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
//change redirect URI to be compatiable with heroku server (IE not local host)
var redirect_uri = 'https://kdr-spotify-project.herokuapp.com/callback';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
//app.set('views', __dirname + '/views');
//capitalize V for directory name because linux respects capital letters.
app.set('views', path.join(__dirname, 'Views')) //heroku uses ubuntu servers. NEed to set folder like this?
app.set('view engine', 'ejs');


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  
  //Added playlist read private to scope and user top read access
  var scope = 'user-read-private user-read-email playlist-read-private user-top-read user-library-read user-read-playback-position playlist-read-collaborative';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/mainmenu?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


//KYLE'S CODE FROM HERE DOWN. PREVIOUS CODE WAS BOILER TEMPLATE FROM SPOTIFY TUTORIAL

app.get('/playlist', function(req,res,body){
  var access_token = req.query.access_token;
  console.log('I am kyel')
  
  var options = {
          url: 'https://api.spotify.com/v1/me/playlists?' + querystring.stringify({
            //set the playlist return limit to be 30 instead of the default 20
            limit : '30'
          }),
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
  console.log(options)

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
          console.log('In Playlist route')
          //console.log(body);
          var totalPlaylistNumber = body.total
          var limit = body.limit
          var totalPlaylistNumberMessage = "totalPlaylistNumber:" + totalPlaylistNumber
          var playlists = body.items
          
          //JSON that can be seen from the front end. Send it back to the request
          res.send({
            'playlistTotal': totalPlaylistNumber,
            'playlists': playlists}
            )
        });
})




app.get('/playlistRenderPage', function(req,res,body){
  
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  


  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    
    res.render('topArtist');
    console.log('SIIIIKE you made it through')
  }
  




})



//First top artist route used to initally render in topArtist view
app.get('/userTopArtistRenderPage', function(req,res,body){
  
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  

  console.log('The tokens your highness');
  console.log(access_token)
  console.log(refresh_token)
  console.log(req.query)



  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    
    res.render('topArtist');
    console.log('SIIIIKE you made it through')
  }
  




})



app.get('/userTopArtist', function(req,res,body){

  console.log('In the user top track info route');
  var access_token = req.query.access_token

  console.log(access_token)
  //var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  
  var urlString = 'https://api.spotify.com/v1/me/top/artists?'

  if (offset != undefined){
    urlString += querystring.stringify({
      time_range : time_range,
      offset: offset

    })
  }
  //console.log('this is the url string below');
  //console.log(urlString)

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done old man. Sending ____');
      
      //send the data back to the front end
      res.send(body);
    })
    
  }




})






//Route for top artist next button
app.get('/userTopArtistNext', function(req,res,body){


  console.log('In the user top artist next route');
  var access_token = req.query.access_token

  
  var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  var urlString = 'https://api.spotify.com/v1/me/top/artists?'

  if (offset != undefined){
    urlString += querystring.stringify({
      offset: offset,
      time_range: time_range
    })
  }

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done');
      if (error != null || error != undefined){
        console.log('encountered error')
        console.log(error)

      }
      else{
        console.log(body);
        //send the data back to the front end
        res.send(body);

      }
      
    })
  }
    

})

//Route for top artist previous button
app.get('/userTopArtistPrev', function(req,res,body){
  console.log('In the previous button route');
  var access_token = req.query.access_token

  //console.log(access_token)
  var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  var urlString = 'https://api.spotify.com/v1/me/top/artists?'

  if (offset != undefined){
    urlString += querystring.stringify({
      offset: offset,
      time_range: time_range
    })

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }

  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done');
      if (error != null || error != undefined){
        console.log('encountered error')
        console.log(error)

      }
      else{
        // console.log(body);
        //send the data back to the front end
        res.send(body);

      }
      
    })
  }



  }

})

//Main menu route to display the menu view
app.get('/mainmenu', function(req,res,body){
  console.log('In mainmenu route')
  if (req.query.refresh_token == undefined || req.query.access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken');
  }

  else{
    res.render('menu')
  }

})



//Route called from main menu for top tracks selection
app.get('/userTopTracksRenderPage', function(req,res,body){
  
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  

  // console.log('The tokens your highness');
  // console.log(access_token)
  // console.log(refresh_token)
  // console.log(req.query)



  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    
    res.render('topTracks');
    // console.log('SIIIIKE you made it through')
  }
  




})


//Route to make first APi request for top tracks
app.get('/userTopTracks', function(req,res,body){

  console.log('In the user top track info route');
  var access_token = req.query.access_token

  console.log(access_token)
  //var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  
  var urlString = 'https://api.spotify.com/v1/me/top/tracks?'

  if (offset != undefined){
    urlString += querystring.stringify({
      time_range : time_range,
      offset: offset

    })
  }
  console.log('this is the url string below');
  console.log(urlString)

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done old man. Sending ____');
      //console.log(body);
      //send the data back to the front end
      res.send(body);
    })
    
  }




})






//Route from top Tracks Next button
app.get('/userTopTracksNext', function(req,res,body){


  console.log('In the user top artist next route');
  var access_token = req.query.access_token

  //console.log(access_token)
  var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  var urlString = 'https://api.spotify.com/v1/me/top/tracks?'

  if (offset != undefined){
    urlString += querystring.stringify({
      offset: offset,
      time_range: time_range
    })
  }

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done');
      if (error != null || error != undefined){
        console.log('encountered error')
        console.log(error)

      }
      else{
        console.log(body);
        //send the data back to the front end
        res.send(body);

      }
      
    })
  }
    

})

//Route from the top tracks previous button
app.get('/userTopTracksPrev', function(req,res,body){
  console.log('In the previous button route');
  var access_token = req.query.access_token

  //console.log(access_token)
  var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  var urlString = 'https://api.spotify.com/v1/me/top/tracks?'

  if (offset != undefined){
    urlString += querystring.stringify({
      offset: offset,
      time_range: time_range
    })

  var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
  if ( access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }

  else {
    request.get(options, function(error, response, body){
      console.log('The deed is done');
      if (error != null || error != undefined){
        console.log('encountered error')
        console.log(error)

      }
      else{
        console.log(body);
        //send the data back to the front end
        res.send(body);

      }
      
    })
  }



  }

})




console.log('Listening on '+ port);
app.listen(port);


