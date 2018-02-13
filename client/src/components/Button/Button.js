import React from 'react';
import './Button.css';

const Button = ({label, onClick}) => (
  <button type="button" onClick={onClick}>{label}</button>
)

export default Button;