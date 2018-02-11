import React from 'react';
import Button from './Button';

const Return = ({subreddit, onReturn}) => (
  <div>
    <Button onClick={onReturn} label="BACK"/>
    Listing information for /r/{subreddit}
  </div>
)

export default Return;