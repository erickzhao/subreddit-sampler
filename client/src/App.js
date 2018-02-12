import React, { Component } from 'react';
import './App.css';
import SearchWrapper from './SearchWrapper';
import Authenticator from './Authenticator';

class App extends Component {
  constructor(props) {
    super(props);

    if (!sessionStorage.isAuthenticated) {
      sessionStorage.isAuthenticated = false;
    }

    this.state = {
      isAuthenticated: JSON.parse(sessionStorage.isAuthenticated)
    }
  }

  handleAuthenticate = () => {
    fetch('/api/authorize')
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        sessionStorage.isAuthenticated = JSON.stringify(true);
        console.log(data.url)
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