/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require("express"); // Express web server framework
var request = require("request"); // "Request" library
var session = require("express-session");
var cors = require("cors");
var querystring = require("querystring");
var path = require("path");

// conditionally apply local .env if app is run locally
const args = process.argv.slice(2);
if (args[0] === "local-deployment") {
  require("dotenv").config({ path: ".env" });
}

var port = process.env.PORT;
var host = process.env.HOST;
var session_secret = process.env.ExpressSessionSecret;

var client_id = process.env.SpotifyClientId; // Your client id
var client_secret = process.env.SpotifyClientSecret; // Your secret
var redirect_uri = process.env.RedirectUri;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = "spotify_auth_state";
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

app.use(express.static(__dirname + "/public")).use(cors());
// .use(cookieParser());

app.use(express.static(path.join(__dirname, "build")));
//TODO add secret: true to cookie for production deployment
app.use(
  session({
    secret: session_secret,
    name: stateKey,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 600000 },
    saveUninitialized: true,
    resave: false,
  })
);

app.get("/login", function (req, res) {
  console.log("session id", req.session.id);
  // set status to logging to check in the callback route
  req.session.status = "logging-in";
  var scope =
    "user-read-private user-read-email playlist-modify-private playlist-read-collaborative playlist-read-private user-top-read user-library-read playlist-modify-public user-read-currently-playing";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;

  const isSessionValid = req.session.status === "logging-in";

  if (!isSessionValid) {
    //if session isn't valid then destroy the session and send error
    req.session.destroy(function (error) {
      res.status(401).send(
        querystring.stringify({
          error: "state_mismatch",
        })
      );
    });
  } else {
    //regnerate the session as authentication status has changed
    req.session.regenerate(function (error) {
      if (error) {
        console.log("error ", error);
        res.redirect(`${host}/error`);
      } else {
        req.session.status = "authenticated";
        var authOptions = {
          url: "https://accounts.spotify.com/api/token",
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: "authorization_code",
          },
          headers: {
            Authorization:
              "Basic " +
              new Buffer.from(client_id + ":" + client_secret).toString(
                "base64"
              ),
          },
          json: true,
        };
        // attempt to get authenticated tokens
        request.post(authOptions, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            var access_token = body.access_token,
              refresh_token = body.refresh_token;

            req.session.accessToken = access_token;

            var options = {
              url: "https://api.spotify.com/v1/me",
              headers: { Authorization: "Bearer " + access_token },
              json: true,
            };

            // use the access token to access the user Id
            request.get(options, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                let userId = body.id;

                req.session.userId = userId;

                res.redirect(`${host}/dashboard`);
              } else {
                console.log("error occured when getting userId", error);
                console.log("response statusCode", response.statusCode);
                console.log("response statusMessage", response.statusMessage);
                console.log("response.body", response.body);
                // destory session as session is going back to an unathenticated state
                req.session.destroy(function (error) {
                  res.redirect(`${host}/error`);
                });
              }
            });
          } else {
            res.status(401).send(
              querystring.stringify({
                error: "invalid_token",
              })
            );
          }
        });
      }
    });
  }
});

app.get("/refresh_token", function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;

  var authOptions = {
    url: `{host}/dashboard`,
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from((client_id + ":" + client_secret).toString(), "base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.get("/playlists", (req, res) => {
  console.log("/playlists route");
  const isSessionValid = req.session.status === "authenticated";

  if (!isSessionValid) {
    console.log("destroying session");
    req.session.destroy(function (error) {
      res.status(401).send("invalid session");
    });
  } else {
    const userId = req.session.userId;
    const accessToken = req.session.accessToken;

    var options = {
      url: `https://api.spotify.com/v1/users/${userId}/playlists`,
      headers: { Authorization: "Bearer " + accessToken },
      json: true,
    };

    request.get(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(
          "got successful playlist api call sending data to frontend"
        );
        res.send(body);
      } else {
        console.log("/playlists ran into an error");
        console.log("error ", error);
        res.status(401).send(error);
      }
    });
  }
});

app.get("/playlist-tracks", (req, res) => {
  const isSessionValid = req.session.status === "authenticated";

  if (!isSessionValid) {
    req.session.destroy(function (error) {
      res.status(401).send("invalid session");
    });
  } else {
    const accessToken = req.session.accessToken;
    var url = req.query.url;
    var options = {
      url: url,
      headers: { Authorization: "Bearer " + accessToken },
      json: true,
    };
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log("got successful tracks api call sending data");
        res.send(body);
      } else {
        console.log("/playlists-tracks ran into an error");
        console.log("error ", error);
        res.status(401).send(error);
      }
    });
  }
});

app.listen(port);

// serve all other requests from react frontend
app.get("/*", (req, res) => {
  console.log("sending to the frontend");
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
