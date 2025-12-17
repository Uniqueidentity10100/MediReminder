import React from 'react';
import './Card.css';

const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`card ${className} ${onClick ? 'card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
