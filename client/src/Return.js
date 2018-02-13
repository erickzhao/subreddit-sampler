import React from 'react';
import Button from './Button';

const Return = ({subreddit, onReturn}) => (
  <div>
    <Button onClick={onReturn} label="Return"/>
    <h2>/r/{subreddit}</h2>
  </div>
)

export default Return;