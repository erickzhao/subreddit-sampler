import React, { Component } from 'react';
import './App.css';
import Search from './Search';

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
        <Search subreddit={this.state.subreddit} />
      </div>
    );
  }
}

export default App;