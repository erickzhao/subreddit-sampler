import React, { Component } from 'react';
import './Search.css';
import Button from './Button';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      subreddit: props.subreddit,
      isSearched: props.isSearched
    }
  }

  render() {
    return (
      <div>
        <form>
          <label>
          Let's sample from from /r/ 
            <input type="text" value={this.state.value} onChange={this.props.onChange}/>
            <br/>
            <Button label="Generate Playlist" onClick={this.props.onSearch}/>
          </label>
        </form>
      </div>
    )
  }
}

export default Search;