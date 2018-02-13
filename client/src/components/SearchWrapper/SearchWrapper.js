import React, { Component } from 'react';
import Search from '../Search/Search';
import Return from '../Return/Return';
import ResultsWrapper from '../ResultsWrapper/ResultsWrapper';

class SearchWrapper extends Component {
  // Initialize state
  constructor(props) {
    super(props);

    this.state = {
      subreddit: null,
      isSearched: false
    }
  }

  handleSearch = (event) => {
    this.setState({ isSearched: true });
    event.preventDefault();
  }

  handleChangeInSearch = (event) => {
    this.setState({ subreddit: event.target.value });
  }

  handleReturn = (event) => {
    this.setState({ subreddit: null, isSearched: false });
  }

  render() {
    const { subreddit, isSearched } = this.state;
    const { token } = this.props;

    return (
      <div>
        {
          !isSearched ? 
          <Search subreddit={subreddit} onChange={this.handleChangeInSearch} onSearch={this.handleSearch}/>
          :
          <div>
            <Return subreddit={subreddit} onReturn={this.handleReturn}/>
            <ResultsWrapper token={token} subreddit={subreddit}/>
          </div>
        }
      </div>
    );
  }
}

export default SearchWrapper;