import React, { Component } from 'react';
import './App.css';

class App extends Component {
  // Initialize state
  state = {
    subreddit: null
  }

  // Fetch passwords after first mount
  componentDidMount() {
  }

  render() {
    const { subreddit } = this.state;

    return (
      <div className="App">
        <h1>fictional-octo-disco</h1>
      </div>
    );
  }
}

export default App;