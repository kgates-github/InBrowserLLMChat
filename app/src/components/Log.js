import React, { useEffect, useState, useContext } from 'react';
import { LogContext } from './LogContext';

function Log({ entries }) {
  const new_logs = [...entries].reverse();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  }
  
  return (
    <div className="logs"
      style={{
        position:"absolute",
        top: "0px",
        left: isOpen ? "0px" : "-234px",
        height: "100%",
        width: "200px",
        borderRight:"1px solid #999",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <div 
        style={{
          display: "flex", 
          flexDirection: "row",
          background: "white",
        }}>
          <div style={{flex: 1, background: "none", paddingTop:"8px"}}>LOGS</div>
          <div 
            onClick={toggleOpen}            
            style={{
              width: "20px", 
              background: "none", 
              paddingRight:"8px", 
              position:"relative",
              right:"-50px",
              zIndex: 100000,
              cursor: "pointer",
              background: "none",
            }}
          >
            <span className="material-icons-outlined" style={{fontSize:"30px"}}>
              {isOpen ? "arrow_left" : "arrow_right"}
            </span>
          </div>
      </div>
      <div className="log-container">
      {new_logs.map((entry, index) => (
        <div key={`log-0${index + 1}`} className="log">{entry}</div>
      ))}
      </div>
    </div>
  );
}

export default Log;