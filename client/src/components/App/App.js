import React, { Component } from 'react';
import './App.css';
import SearchWrapper from '../SearchWrapper/SearchWrapper';
import Authenticator from '../Authenticator/Authenticator';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokens: {}
    }
  }

  componentDidMount() {
    // Get hash elements passed into URL.
    // Will be empty on initial load, but will be passed back
    // after Spotify authorization loop.
    const hash = this.getHashElements(window.location.hash);
    window.location.hash = '';
    this.setState({tokens: hash});
  }

  // Gets key:val pairings from ?key=val&key=val&key=val
  getHashElements = (hash) => {
    return hash
    .substring(1)
    .split('&')
    .reduce((acc, val) => {
      if (val) {
        var parts = val.split('=');
        acc[parts[0]] = decodeURIComponent(parts[1]);
      }
      return acc;
    }, {});
  }

  // Gets authorization URL from server and redirects user
  // to Spotify authentication page
  handleAuthenticate = () => {
    fetch('/authorize')
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        window.location = data.url;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  render() {
    const { tokens } = this.state;

    return (
      <div className="App">
        <h1>Subreddit Sampler</h1>
        {
          Object.keys(tokens).length ?
          <SearchWrapper token={tokens['access_token']}/> :
          <Authenticator onAuthenticate={this.handleAuthenticate}/>
        }
      </div>
    );
  }
}

export default App;