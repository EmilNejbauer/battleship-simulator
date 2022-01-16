import React from "react";
import './square.styles.css';

const Square = (props) => (
    <div className={`square ${props.shipType}`}>
        {props.value ? "X" : ""} 
    </div>
);

export default Square;