import React, { useContext, useEffect } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function Supplement(props) {
  const log = useContext(LogContext);

  const vaiants = {
    open: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'backOut',}
    },
    dormant: {
      x: -10,
      y: 0,
      scale: 0,
      opacity: 0,
      //transition: { duration: 3, ease: 'easeInOut', delay: 1, type: 'spring', stiffness: 600, damping: 20 }
    }
  }

  return (
    <motion.div 
      animate={props.isActive ? "open" : "dormant"}
      initial="dormant"
      variants={vaiants}
      style={{padding:"0px", marginTop:"20px", cursor:"pointer"}}
    >
      
      <div 
        onClick={() => { alert("Supplement clicked") }}
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: "12px",
          background: props.spec.color,
          borderRadius: "12px",
          height: "36px",
          alignItems: "center",
        }}
      >
        <div style={{paddingTop:"4px", marginRight:"8px"}}>
          <span 
            className="material-icons-outlined" 
            style={{
              fontSize: "20px",
              fontWeight: "400", 
              color: "#fff", 
            }}>
            arrow_forward
          </span>
        </div>
        <div style={{
          flex:"1",
          fontFamily:"Open Sans", 
          fontSize:"14px",
          fontWeight:"400", 
          color:"#fff",
        }}>
          {props.spec.text}
        </div>
        <div style={{paddingTop:"4px", marginRight:"8px"}}>
          <span 
            className="material-icons-outlined" 
            style={{
              fontSize: "20px",
              fontWeight: "400", 
              color: "#fff", 
            }}>
            {props.spec.icon}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default Supplement;
