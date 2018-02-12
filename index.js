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
  const LENGTH = 30;
  let after;
  let posts = [];
  await setRedditToken();

  while (posts.length < LENGTH) {
    try {
      const data = await getSubredditData('hiphopheads', after);
      const newPosts = filterPosts(data.children);
      posts.push(...newPosts);
      after = data.after;
    } catch(e) {
      console.error(e);
    }
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`fictional-octo-disco listening on ${port}`);