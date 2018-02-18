import React from 'react';
import Button from '../Button/Button';

const Return = ({subreddit, onReturn}) => (
  <div>
    <Button onClick={onReturn} label="Return"/>
  </div>
)

export default Return;