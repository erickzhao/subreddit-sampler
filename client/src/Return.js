import React from 'react';
import Button from './Button';

const Return = ({subreddit, onReturn}) => (
  <div>
    <Button onClick={onReturn} label="BACK"/>
    Sample generated from /r/{subreddit}.
  </div>
)

export default Return;