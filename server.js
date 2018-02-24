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
  redirectUri: process.env.APP_CALLBACK,
  clientId: process.env.SPOTIFY_CLIENT,
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

  } catch (e) {
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
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({
    url: authorizeURL
  });
})

// set API routes to /api/
const router = express.Router();

// Get spotify tracks based on upvotes in subreddit
// SIDE EFFECT: will also generate corresponding spotify playlist
router.get('/r/:sub', async (req, res) => {
  const LENGTH = 20; // default number of tracks to fetch
  const FAIL_LIMIT = 10; // number of empty pages before abort
  let after;
  let tracks = [];
  let uri;
  await setRedditToken(); // always refresh reddit token

  // use token generated earlier to have instance-specific API wrapper
  const userSpotifyApi = new SpotifyWebApi();
  userSpotifyApi.setAccessToken(req.headers['authorization'].split(' ')[1]);

  // no subreddit in parameters, return empty array
  if (!req.params.sub) {
    return res.json({
      tracks: [],
      uri: null
    });
  }

  // keep fetching tracks until we get enough
  // OR, if we failed enough times, abort mission
  let failCounter = 0;
  const numSongsForArtist = {};

  while (tracks.length < LENGTH && failCounter < FAIL_LIMIT) {
    const postQueue = []; // create queue of reddit posts
    try {
      // grab a page of candidate posts and find the possible music links
      const data = await getSubredditData(req.params.sub, after);
      postQueue.push(...getPotentialMusicLinks(data.children));
      after = data.after;
    } catch (e) {
      console.error(e);
    }
    (postQueue.length === 0) ? failCounter++ : failCounter = 0;

    try {
      // attempt to find all tracks from queue on Spotify
      const spotifyTracks = await Promise.all(
        postQueue.map(p => userSpotifyApi.searchTracks(`${p[0]} ${p[1]}`))
      );

      // use reducer to accumulate track info
      const reducer = (acc, val) => {
        const firstResult = _.head(val.body.tracks.items); // only get first result

        if (firstResult && firstResult.type === 'track') { // only get tracks
          const trackInfo = _.pick(firstResult, ['name', 'uri']);

          trackInfo.artists = firstTrack.artists.map(a => a.name);
          const mainArtist = trackInfo.artists[0];

          // don't add more than 1 song per artist and remove stupid karaoke versions
          numSongsForArtist[mainArtist] = numSongsForArtist[mainArtist] || 0;
          numSongsForArtist[mainArtist]++;
          if (mainArtist.indexOf('Karaoke') === -1 && numSongsForArtist[mainArtist] <= 1) {
            acc.push(trackInfo);
          }
        }
        return acc;
      }
      tracks.push(...spotifyTracks.reduce(reducer, []));
      postQueue.length = 0; // empty post queue
    } catch(e) {
      console.error(e);
    }
  }

  if (tracks.length < LENGTH) {
    return res.json({
      tracks: [],
      uri: null
    });
  }

  tracks.length = LENGTH; // trim playlist so we have a neat number of tracks

  try {
    // do playlist stuff here
    const trackIds = tracks.map(t => t.uri);
    const id = (await userSpotifyApi.getMe()).body.id;
    const playlist = await userSpotifyApi.createPlaylist(id, `/r/${req.params.sub} sampler`, {
      public: true
    });
    uri = playlist.body.uri;
    await userSpotifyApi.addTracksToPlaylist(id, playlist.body.id, trackIds);

  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: 'An error occurred while processing the Spotify API'
    });
  }

  return res.json({
    tracks: tracks,
    uri: uri
  });
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
  } catch (e) {
    console.error(e);
  }
  process.env.REDDIT_TOKEN = token && token.data && token.data.access_token;
}

// fetches top posts from this year
const getSubredditData = async (sub, after) => {
  let data;
  try {
    data = await axios({
      url: `https://oauth.reddit.com/r/${sub}/top?limit=100&t=all&after=${after}`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${process.env.REDDIT_TOKEN}`
      }
    });
  } catch (e) {
    console.error(e);
  }
  return data.data.data;
}

// filter out posts to get songs
const getPotentialMusicLinks = (posts) => {
  // store whitelisted domains in object for O(1) access
  // these domains typically have music on them
  const DOMAINS = {
    'youtube.com': true,
    'soundcloud.com': true,
    'youtu.be': true
  }
  const TOO_LONG = 40;

  return posts
  .filter(post => DOMAINS[post.data.domain]) //domain whitelist
  .map(post => getArtistTitle(post.data.title)) // parse artist/title
  .filter(post => {
    return post && post[0].length < TOO_LONG && post[1].length < TOO_LONG}); // remove artist/title not found links
}

app.use('/api', router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Subreddit Sampler listening on ${port}`);