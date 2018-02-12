import React, { Component } from 'react';
import './App.css';
import SearchWrapper from './SearchWrapper';
import Authenticator from './Authenticator';

class App extends Component {
  constructor(props) {
    super(props);

    if (localStorage.isAuthenticated === undefined) {
      localStorage.isAuthenticated = false;
    }

    this.state = {
      isAuthenticated: JSON.parse(localStorage.isAuthenticated)
    }
  }

  handleAuthenticate = () => {
    fetch('/api/spotify')
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        localStorage.isAuthenticated = JSON.stringify(true);
        window.location = data.url;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  render() {
    const { isAuthenticated } = this.state;

    return (
      <div className="App">
        <h1>fictional-octo-disco</h1>
        {
          isAuthenticated ?
          <SearchWrapper/> :
          <Authenticator onAuthenticate={this.handleAuthenticate}/>
        }
      </div>
    );
  }
}

export default App;