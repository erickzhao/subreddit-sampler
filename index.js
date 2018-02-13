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

// callback from redirect URI after Spotify authorized
app.get('/callback', async (req, res) => {
  const code = req.query.code; // Read the authorization code from the query parameters
  let token;
  // Grab exchange code for access token.
  try {
    token = await spotifyApi.authorizationCodeGrant(code);
    console.log('The token expires in ' + token.body['expires_in']);
    console.log('The access token is ' + token.body['access_token']);
    console.log('The refresh token is ' + token.body['refresh_token']);

  } catch(e) {
    console.error(e);
  }
  // If everything goes well, refresh the page with token displayed in URL hash.
  // Client-side logic will handle storing the token so each user has their own
  // token that accesses permissions to their own account.
  if (token) {
    res.redirect(`/#access_token=${token.body['access_token']}&refresh_token=${token.body['refresh_token']}`);
  } else {
    res.redirect('/');
  }
  
});

// Initiate Spotify authorization loop
app.get('/authorize', (req, res) => {
  // scope: read user profile and edit their public playlists.
  const scopes = ['user-read-private', 'playlist-modify-public'];

  // generate an authorization URL from which we get a code
  authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({url: authorizeURL});
})

// set API routes to /api/
const router = express.Router();

// Get spotify tracks based on upvotes in subreddit
// SIDE EFFECT: will also generate corresponding spotify playlist
router.get('/r/:sub', async (req, res) => {
  const LENGTH = 20; // default number of potential tracks to fetch
  let after;
  let posts = [];
  let tracks = [];
  await setRedditToken(); // always refresh reddit token

  // no subreddit, return empty array
  if (!req.params.sub) {
    return res.json(posts);
  }

  // keep fetching candidate tracks until we get enough
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

  // use token generated earlier to have instance-specific API wrapper
  const userSpotifyApi = new SpotifyWebApi();
  userSpotifyApi.setAccessToken(req.headers['authorization'].split(' ')[1]);

  try {
    const spotifyTracks = await Promise.all(
      posts.map(p => userSpotifyApi.searchTracks(`${p[0]} ${p[1]}`))
    );

    tracks = spotifyTracks
      .reduce((acc,val) => {
        const firstTrack = _.head(val.body.tracks.items);
        if (firstTrack && firstTrack.type === 'track') {
          const trackInfo = _.pick(firstTrack, ['name', 'uri']);
          trackInfo.artists = firstTrack.artists.map(a => a.name);
          acc.push(trackInfo);
        }
        return acc;
      }, []);

    const trackIds = tracks.map(t => t.uri);
    const id = (await userSpotifyApi.getMe()).body.id;
    const playlist = await userSpotifyApi.createPlaylist(id, `/r/${req.params.sub}`, {public: true});
    await userSpotifyApi.addTracksToPlaylist(id, playlist.body.id, trackIds);
  } catch (e) {
    console.error(e);
  }

  console.log(tracks);
  return res.json(tracks);
});

// sets reddit access token in process.env
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

// fetches top posts from this year
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

// filter out posts to get songs
const filterPosts = (posts) => {
  // store whitelisted domains in object for O(1) access
  // these domains typically have music on them
  const DOMAINS = {
    'youtube.com': true,
    'soundcloud.com': true,
    'youtu.be': true
  }
  return posts
  .filter(post => DOMAINS[post.data.domain]) //domain whitelist
  .map(post => getArtistTitle(post.data.title)) // parse artist/title
  .filter(post => post); // remove artist/title not found links
}

app.use('/api', router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`fictional-octo-disco listening on ${port}`);