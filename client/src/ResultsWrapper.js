import React, { Component } from 'react';

class ResultsWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      tracks: []
    }
  }

  componentDidMount() {
    this.fetchTracks()
      .then((res) => {
        console.log(res);
        this.setState({isLoaded: true});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  fetchTracks = () => {
    return fetch(`/api/tracks`);
  }

  render() {
    return (
      <div>
      </div>
    )
  }

}

export default ResultsWrapper;