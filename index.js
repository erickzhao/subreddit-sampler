const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const getArtistTitle = require('get-artist-title');
const SpotifyWebApi = require('spotify-web-api-node');
const _ = require('lodash');

// grab super secret stuff from .env file
dotenv.config();

const app = express();
const spotifyApi = new SpotifyWebApi({
  redirectUri : 'http://localhost:5000/callback',
  clientId : process.env.SPOTIFY_CLIENT,
  clientSecret: process.env.SPOTIFY_SECRET
});

let spotifyId = '';

app.get('/callback', async (req, res) => {
  const code = req.query.code; // Read the authorization code from the query parameters
  try {
    const token = await spotifyApi.authorizationCodeGrant(code);

    console.log('The token expires in ' + token.body['expires_in']);
    console.log('The access token is ' + token.body['access_token']);
    console.log('The refresh token is ' + token.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(token.body['access_token']);
    spotifyApi.setRefreshToken(token.body['refresh_token']);
  } catch(e) {
    console.error(e);
  }

  res.redirect('/');
});

// set all routes to /api/
const router = express.Router();

router.get('/authorize', (req, res) => {
  const scopes = ['user-read-private', 'playlist-modify-public'];

  authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({url: authorizeURL});
})

router.get('/r/:sub', async (req, res) => {
  const LENGTH = 20;
  let after;
  let posts = [];
  await setRedditToken();

  // no subreddit, return empty array
  if (!req.params.sub) {
    return res.json(posts);
  }

  while (posts.length < LENGTH) {
    try {
      const data = await getSubredditData(req.params.sub, after);
      const newPosts = filterPosts(data.children);
      posts.push(...newPosts);
      after = data.after;
    } catch(e) {
      console.error(e);
    }
  }

  try {
    const spotifyTracks = await Promise.all(
      posts.map(p => spotifyApi.searchTracks(`${p[0]} ${p[1]}`))
    );
    const trackIds = spotifyTracks
      .map(t => (t.body.tracks))
      .filter(t => t.total > 0)
      .map(t => _.head(t.items))
      .filter(t => t.type === 'track')
      .map(t => t.uri);
      
    const id = (await spotifyApi.getMe()).body.id;
    const playlist = await spotifyApi.createPlaylist(id, `/r/${req.params.sub}`, {public: true});
    await spotifyApi.addTracksToPlaylist(id, playlist.body.id, trackIds);
  } catch (e) {
    console.error(e);
  }

  return res.json(posts);
});

const setRedditToken = async () => {
  let token;
  try {
    token = await axios({
      url: 'https://www.reddit.com/api/v1/access_token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: process.env.REDDIT_CLIENT,
        password: process.env.REDDIT_SECRET
      },
      data: "grant_type=client_credentials"
    });
  } catch(e) {
    console.error(e);
  }
  process.env.REDDIT_TOKEN = token && token.data && token.data.access_token;
}

const getSubredditData = async (sub, after) => {
  let data;
  try {
    data = await axios({
      url: `https://oauth.reddit.com/r/${sub}/top?limit=100&t=year&after=${after}`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${process.env.REDDIT_TOKEN}`
      }
    });
  } catch(e) {
    console.error(e);
  }
  return data.data.data;
}

const filterPosts = (posts) => {
  // store whitelisted domains in object for O(1) access
  const DOMAINS = {
    'youtube.com': true,
    'soundcloud.com': true,
    'youtu.be': true
  }
  return posts
    .filter(post => DOMAINS[post.data.domain])
    .map(post => getArtistTitle(post.data.title)) // parse artist/title
    .filter(post => post); // remove artist/title not found links
}

app.use('/api', router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//   // res.sendFile(path.join(__dirname + '/client/build/index.html'));
// });

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`fictional-octo-disco listening on ${port}`);