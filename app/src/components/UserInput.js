import React, { useContext } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function UserInput(props) {
  const log = useContext(LogContext);

  const variantsMic = {
    on: {
      opacity: 1,
      color: ["#aaa", "#111"], // array of colors to cycle through
      transition: {
        duration: 0.3, // duration of one cycle
        repeat: Infinity, // repeat the cycle indefinitely
        repeatType: "reverse",
      },
    },
    off: {
      opacity: 0,
      color: "#222", // static color when not blinking
    },
  }

  return (
    <>
      <div 
        style={{
          height:"80px", 
          background:"#fff", 
          border: "1px solid #AEBBCC", 
          padding:"8px",
          marginBottom:"12px",
          borderRadius:"4px",
      }}>
        {/* Hint */}
        <div style={{ 
          position:"absolute", 
          width:"340px", 
          height:"80px", 
          background:"none",
          display: props.micActive ? "none" : "flex",
          justifyContent:"center",
          alignItems:"center",
        }}> 
          <img src={process.env.PUBLIC_URL + '/svg/coachtip_hand_mic.svg'} 
            alt="open hand = mic" 
            style={{width:'auto', height:'auto',}}
          />
        </div>
        <div style={{float:"left", width:"20px", height:"20px", borderRadius:"50%", background:"none", marginRight:"8px"}}>
          <motion.span 
            className="material-icons" 
            animate={props.micActive ? "on" : "off"}
            initial="off"
            variants={variantsMic}
            style={{
              fontSize: "20px", 
            }}>
            mic
          </motion.span> 
        </div>{props.userInput}
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
