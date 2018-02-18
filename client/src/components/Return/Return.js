import React from 'react';
import Button from '../Button/Button';

const Return = ({uri, onReturn}) => {

  const onClick = () => {
    window.location=uri;
  }
  return (
  <div>
    <Button onClick={onReturn} label="Return"/>
    <Button onClick={onClick} label="View on Spotify Client"/>
  </div>
  )
}


export default Return;