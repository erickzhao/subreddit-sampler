import React, { Component } from 'react';
import './Search.css';

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
          Subreddit:
            <input type="text" value={this.state.value} onChange={this.handleChange}/>
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}

export default Search;