import React, { Component } from 'react';
import './App.css';
import Search from './Search';
import Return from './Return';

class App extends Component {

  // Initialize state
  constructor(props) {
    super(props);

    this.state = {
      subreddit: null,
      isSearched: false
    }
  }

  handleSearch = (event) => {
    this.setState({isSearched: true});
    event.preventDefault();
  }

  handleChangeInSearch = (event) => {
    this.setState({subreddit: event.target.value});
  }

  handleReturn = (event) => {
    this.setState({subreddit: null, isSearched: false});
  }

  render() {
    const { subreddit } = this.state;

    return (
      <div className="App">
        <h1>fictional-octo-disco</h1>
        {
          !this.state.isSearched ? <Search subreddit={this.state.subreddit} onChange = {this.handleChangeInSearch} onSearch={this.handleSearch}/>
          : <Return subreddit={this.state.subreddit} onReturn={this.handleReturn}/>
        }
      </div>
    );
  }
}

export default App;