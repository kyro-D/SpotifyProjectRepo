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
 require('dotenv').config({path:".env"});
 var path = require('path');
 
 var client_id = process.env.SpotifyClientId; // Your client id
 var client_secret = process.env.SpotifyClientSecret; // Your secret
//  var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

// redirect uri for heroku deployment
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
  var stateToken = generateRandomString(16);
  //todo ask SO why these are different. 
  // var unsafeSecret1 = 'this is a test';
  // console.log('correct val ', Buffer.from(unsafeSecret1).toString('base64'));
  // console.log(Buffer.from(unsafeSecret1));
  // console.log(Buffer.from(unsafeSecret1, 'base64'));
  // console.log(Buffer.from(unsafeSecret1, 'base64').toString());
  // console.log(Buffer.from(unsafeSecret1, 'base64').toString('base64'));
  // console.log('blank');
  // console.log(unsafeSecret1.toString('base64'));
     
 
 var app = express();
 
 app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

 app.use(express.static(path.join(__dirname, 'build')));
 
 app.get('/login', function(req, res) {
 
   var state = generateRandomString(16);
   res.cookie(stateKey, state);
 
   // your application requests authorization
   var scope = 'user-read-private user-read-email';
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
     
    res.status(401).send(
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
         'Authorization': 'Basic ' + new Buffer.from(client_id + ':' + client_secret).toString('base64')
       },
       json: true
     };
 
     request.post(authOptions, function(error, response, body) {
       if (!error && response.statusCode === 200) {
         console.log('it worked')
 
         var access_token = body.access_token,
             refresh_token = body.refresh_token;
 
        //  var options = {
        //    url: 'https://api.spotify.com/v1/me',
        //    headers: { 'Authorization': 'Bearer ' + access_token },
        //    json: true
        //  };
 
        //  // use the access token to access the Spotify Web API
        //  request.get(options, function(error, response, body) {
        //    console.log(body);
        //  });
 
         var params = new URLSearchParams;
         params.append('access_token', access_token);
         params.append('refresh_token', refresh_token);
         // we can also pass the token to the browser to make requests from there
         res.redirect('http://localhost:8888/dashboard?'+
            params
          );
       } else {
         res.status(401).send(
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
    url: `https://${HOST}:${PORT}/dashboard`,
    headers: { 'Authorization': 'Basic ' + (new Buffer.from((client_id + ':' + client_secret).toString(), 'base64')) },
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


 app.get('/', (req, res) => {
    console.log('Hello World!')
  });

  app.get('/playlists', (req, res) => {
    var access_token = req.query.access_token;
    
    var options = {
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log('got successful api call sending data');
        res.send(body);
      }
      else {
        console.log('error ',error);
        res.status(401).send(error);
      }
    })

  })

  app.get('/playlist-tracks', (req, res) => {
    var access_token = req.query.access_token;
    var url = req.query.url;
    var options = {
      url: url, 
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    }
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log('got successful api call sending data');
        res.send(body);
      }
      else {
        console.log('error ',error);
        res.status(401).send(error);
      }
    })
  })
 
 console.log('Listening on 8888');
 app.listen(8888);

// serve all other requests from react frontend
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
 