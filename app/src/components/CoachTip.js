import React, { useContext, useEffect } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function CoachTip(props) {
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
    <div style={{
      position:"fixed",
      top: "150px",
      width: "100%",
      display: "flex",
      flexDirection: "row",
      boxShadow: "0px 0px 10px 0px #000"
    }}>
    <div style={{flex:1}}></div>
    <div style={{width:"300px"}}>
    <motion.div 
    animate={props.showCoachTip ? "open" : "closed"}
    initial="closed"
    variants={variants}
    style={{
      position:"fixed",
      top: "150px",
      width: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "none",
      zIndex: 100000,
    }}>
      {/*<div style={{textAlign:"center", marginBottom:"28px", color:"#444"}}>{props.text1}</div>*/}
      <img src={process.env.PUBLIC_URL + '/svg/' + props.image + '.svg'} 
        alt="open hand" 
        style={{width:'auto', height:'60px',}}
      />
      <div style={{textAlign:"center", marginTop:"16px", color:"#fff", width:"150px"}}>{props.text2}</div>
    </motion.div>
    </div>
    <div style={{flex:1}}></div>
    </div>
  );
}

export default CoachTip;
