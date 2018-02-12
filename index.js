const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const getArtistTitle = require('get-artist-title');
const _ = require('lodash');

// grab super secret stuff from .env file
dotenv.config();

const app = express();

// set all routes to /api/
const router = express.Router();

router.get('/tracks', async (req, res) => {
  await setRedditToken();

  const posts = await getSubredditData('music');
  return res.json(filterPosts(posts));
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

const getSubredditData = async (sub) => {
  let data;
  try {
    data = await axios({
      url: `https://oauth.reddit.com/r/${sub}/top`,
      method: 'get',
      headers: {
        'Authorization': `Bearer ${process.env.REDDIT_TOKEN}`
      }
    });
  } catch(e) {
    console.error(e);
  }
  return data.data.data.children;
}

const filterPosts = (posts) => {

  // store whitelisted domains in object for O(1) access
  const DOMAINS = {
    'youtube.com': true,
    'soundcloud.com': true
  }
  return posts
    .filter(post => DOMAINS[post.data.domain])
    .map(post => getArtistTitle(post.data.title))
}

app.use('/api', router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`fictional-octo-disco listening on ${port}`);