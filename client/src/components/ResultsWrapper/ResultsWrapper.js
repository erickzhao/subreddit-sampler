import React, { Component } from 'react';
import Return from '../Return/Return';
import './ResultsWrapper.css'

class ResultsWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      tracks: [],
      uri: null
    }
  }

  componentDidMount() {
    this.fetchTracks(this.props.subreddit)
      .then((res) => {
        this.setState({isLoaded: true, tracks: res.tracks, uri: res.uri});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Get list of Spotify tracks matching a subreddit
  fetchTracks = (sub) => {
    return fetch(`/api/r/${sub}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.props.token}`
      },
    })
    .then(res => res.json())
    .catch((e) => {
      console.error(e);
    });
  }

  render() {
    const { isLoaded, tracks, uri } = this.state;
    const { subreddit, onReturn } = this.props;

    const trackList = tracks.map((t) =>
      <tr key={t.uri}>
        <td className="list--title">{t.name}</td>
        <td className="list--artist">{t.artists.join(', ')}</td>
      </tr>
    )
    return (
      <div>
        <Return subreddit={subreddit} onReturn={onReturn} uri={uri}/>
        <h2>Generated playlist for /r/{subreddit}:</h2>
        {
        !isLoaded &&
          <h1>LOADING</h1>
        }
        <table id="track-listing">
        <tr>
          <th className="list--header">Title</th>
          <th className="list--header">Artist</th>
        </tr>
          {trackList}
        </table>
      </div>
    )
  }

}

export default ResultsWrapper;