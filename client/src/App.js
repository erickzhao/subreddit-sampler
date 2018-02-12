import React, { Component } from 'react';
import './App.css';
import SearchWrapper from './SearchWrapper';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>fictional-octo-disco</h1>
        <SearchWrapper/>
      </div>
    );
  }
}

export default App;