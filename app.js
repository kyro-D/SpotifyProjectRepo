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
var redirect_uri = 'https://'+host+'/callback';

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
  app.set('view engine', 'ejs');
//var playlist = require('playlist');
//var path = 'Macintosh HD⁩/Users⁩/kylerose⁩/Documents⁩/PlaylistProject⁩/SpotifyTutorial⁩/web-api-auth-examples⁩/⁨authorization_code⁩';
//app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  //KYLE added playlist read private to scope 
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
          console.log(body);
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
  //console.log(access_token)
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
          //console.log(totalPlaylistNumberMessage)
          //console.log(body.items[0])

          //want to know if there are more playlists than the limit that was loaded
          // if(limit < totalPlaylistNumber){

          // }
          //JSON that can be seen from the front end. Send it back to the request
          res.send({
            'playlistTotal': totalPlaylistNumber,
            'playlists': playlists}
            )
        });
})


app.get('/playlistContents', function(req,res,body){
  //get the data sent in the ajax request from html code 
  var access_token = req.query.access_token;

  var playlistId = req.query.plId;

  console.log(playlistId)

  console.log('TOWLIE')
  //console.log(body)
  
    
    var urlString = 'https://api.spotify.com/v1/playlists/4tYpWy1PU7PtDxDxB05rzH'
    console.log(urlString)
    var options = {
          url: urlString,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
    //use the request framework 
    request.get(options, function(error, response, body){
      console.log('Made with Tegridy');
      //console.log(body);
      //send over the total number of tracks and the tracks
      //res.sendFile("playlist.html",{root : __dirname + '/public'});
      //res.render("playlist.html",{root : __dirname + '/public'});
      //res.send('playlist')
      // res.send({
      //   'totalTracks' : body.tracks.total,
      //   'tracks' : body.tracks
      // })
      var totalTracks = body.tracks.total
      //response.sendFile("playlist.html")
      var tracks = body.tracks 
      res.redirect('/playlistRenderPage' + options);
      // res.redirect('/playlist' +
      //     querystring.stringify({
      //       access_token: access_token,
      //       refresh_token: refresh_token
      //     }));
    });
    console.log('Made with Tegridy 2');
    //res.redirect('playlist', options);



  })


app.get('/playlistRenderPage', function(req,res,body){
  // code isn't working bc the url from the a tag is staic and isn't including any of the variables passed along from url
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  //var access_token = req
  //var refresh_token = req

  console.log('The tokens your highness');
  console.log(access_token)
  console.log(refresh_token)
  console.log(req.query)



  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    //res.render('playlist');
    res.render('topArtist');
    console.log('SIIIIKE you made it through')
  }
  




})




app.get('/userTopArtistRenderPage', function(req,res,body){
  // code isn't working bc the url from the a tag is staic and isn't including any of the variables passed along from url
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  //var access_token = req
  //var refresh_token = req

  console.log('The tokens your highness');
  console.log(access_token)
  console.log(refresh_token)
  console.log(req.query)



  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    //res.render('playlist');
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

  // var urlString = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term'
  var urlString = 'https://api.spotify.com/v1/me/top/artists?'

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







app.get('/userTopArtistNext', function(req,res,body){


  console.log('In the user top artist next route');
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
        console.log(body);
        //send the data back to the front end
        res.send(body);

      }
      
    })
  }



  }

})

app.get('/mainmenu', function(req,res,body){
  if (req.query.refresh_token == undefined || req.query.access_token == undefined){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken');
  }

  else{
    res.render('menu')
  }

})




app.get('/userTopTracksRenderPage', function(req,res,body){
  // code isn't working bc the url from the a tag is staic and isn't including any of the variables passed along from url
  console.log('Kyle you did it');
  //pass along the access token and request token. If no tokens don't go to url. 
  var access_token = req.query.access_token
  var refresh_token = req.query.refresh_token
  //var access_token = req
  //var refresh_token = req

  console.log('The tokens your highness');
  console.log(access_token)
  console.log(refresh_token)
  console.log(req.query)



  if ( access_token == undefined || refresh_token == undefined ){
    console.log('Sending back to home page');
    res.redirect('/#tokenErr=missingAccessToken') // set error for html to render an alert
  
  }
  else {
    //res.render('playlist');
    res.render('topTracks');
    console.log('SIIIIKE you made it through')
  }
  




})



app.get('/userTopTracks', function(req,res,body){

  console.log('In the user top track info route');
  var access_token = req.query.access_token

  console.log(access_token)
  //var refresh_token = req.query.refresh_token
  var offset = req.query.offset
  var time_range = req.query.time_range

  // var urlString = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term'
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

console.log(process.env.HOST);
