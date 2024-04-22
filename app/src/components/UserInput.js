import React, { useContext } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function UserInput(props) {
  const log = useContext(LogContext);

  const variants = {
    open: {
      opacity: 1,
      scale: 1,
      y: -60,
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }
    },
    closed: {
      opacity: 0,
      scale: 0.9,
      y: -50,
      transition: { duration: 0.1, ease: 'easeInOut', delay: 0 }
    },
    
  }

  return (
    <>
      <div 
        onClick={props.sendQuestion}
        style={{
          height:"80px", 
          background:"#fff", 
          border: "1px solid #AEBBCC", 
          padding:"8px",
          marginBottom:"12px",
          borderRadius:"4px",
      }}>
        {props.userInput} <span className="material-icons" style={{ fontSize: "20px", color: "#222" }}>
          mic
        </span>
      </div>
      
      <div 
        style={{
          display: "flex",
          cursor:"pointer",
          height:"40px", 
          paddingLeft:"6px",
          paddingRight:"6px",
          backgroundd:"yellow", 
          alignContent:"center", 
          justifyContent:"space-between"}}>
        <span 
          className="material-icons-outlined" 
          style={{
            fontSize: "24px",
            fontWeight: "500", 
            color: "#333", 
          }}>
          task
        </span>
        <span 
          className="material-icons-outlined" 
          style={{
            fontSize: "24px",
            fontWeight: "500", 
            color: "#333", 
          }}>
          chat
        </span>
        <span 
          className="material-icons-outlined" 
          style={{
            fontSize: "24px",
            fontWeight: "500", 
            color: "#333", 
          }}>
          notifications
        </span>
      </div>
    </>
  );
}

export default UserInput;
