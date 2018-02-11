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
          Search for /r/ 
            <input type="text" value={this.state.value} onChange={this.props.onChange}/>
            <Button label="GO" onClick={this.props.onSearch}/>
          </label>
        </form>
      </div>
    )
  }
}

export default Search;