import React, { Component } from 'react';
import Search from '../Search/Search';
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
  
  // Since we are managing state locally,
  // need to pass down functions to modify parent
  // state from child.

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
          <ResultsWrapper onReturn={this.handleReturn} token={token} subreddit={subreddit}/>
        }
      </div>
    );
  }
}

export default SearchWrapper;