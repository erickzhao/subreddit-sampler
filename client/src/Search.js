import React, { Component } from 'react';
import './Search.css';
import Button from './Button';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {subreddit: props.subreddit}
  }

  handleChange = (event) => {
    this.setState({subreddit: event.target.value});
  }

  handleSubmit = (event) => {
    const {subreddit} = this.state;
    alert(`Submitting ${subreddit}`);
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
          Search for /r/ 
            <input type="text" value={this.state.value} onChange={this.handleChange}/>
            <Button label="GO"/>
          </label>
        </form>
      </div>
    )
  }
}

export default Search;