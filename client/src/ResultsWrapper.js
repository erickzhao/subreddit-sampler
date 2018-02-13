import React, { Component } from 'react';
import './ResultsWrapper.css'

class ResultsWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      tracks: []
    }
  }

  componentDidMount() {
    this.fetchTracks(this.props.subreddit)
      .then((res) => {
        this.setState({isLoaded: true, tracks: res});
      })
      .catch((err) => {
        console.error(err);
      });
  }

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
    const { isLoaded, tracks } = this.state;

    const trackList = tracks.map((t) =>
      <tr key={t.uri}>
        <td className="list--title">{t.name}</td>
        <td className="list--artist">{t.artists.join(', ')}</td>
      </tr>
    )
    return (
      <div>
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