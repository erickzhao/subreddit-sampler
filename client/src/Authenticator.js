import React from 'react';
import Button from './Button';

const Authenticator = ({onAuthenticate}) => {
  return (
    <div>
      <Button onClick={onAuthenticate} label="Authenticate with Spotify"/>
    </div>
  )
}

export default Authenticator;