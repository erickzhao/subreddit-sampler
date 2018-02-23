import React, { Component } from 'react';
import Return from '../Return/Return';
import loader from './audio.svg';
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
    this.generatePlaylist(this.props.subreddit)
      .then((res) => {
        this.setState({isLoaded: true, tracks: res.tracks, uri: res.uri});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Get list of Spotify tracks matching a subreddit
  generatePlaylist = (sub) => {
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
        {
        !isLoaded ?
          <div>
            <h2>Generating playlist for /r/{subreddit}...</h2>
            <img src={loader}/>
          </div>
          :
          <div>
            {
              (tracks.length > 0) ?
              <div>
                <h2>Generated playlist for /r/{subreddit}:</h2>
                <table id="track-listing">
                  <tr>
                    <th className="list--header">Title</th>
                    <th className="list--header">Artist</th>
                  </tr>
                  {trackList}
                </table>
              </div>
              :
              <div>
                <h2>ERROR: Failed to generate playlist for /r/{subreddit}</h2>
                <h3>Please check if the subreddit exists and has music links.</h3>
              </div>
            }
          </div>
        }
      </div>
    )
  }

}

export default ResultsWrapper;