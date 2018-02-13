import React, { Component } from 'react';
import './App.css';
import SearchWrapper from './SearchWrapper';
import Authenticator from './Authenticator';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokens: {}
    }
  }

  componentDidMount() {
    const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce((acc, val) => {
      if (val) {
        var parts = val.split('=');
        acc[parts[0]] = decodeURIComponent(parts[1]);
      }
      return acc;
    }, {});
    window.location.hash = '';
    this.setState({tokens: hash});
  }

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