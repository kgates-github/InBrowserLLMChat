import React, { useContext, useEffect } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function CoachTip(props) {
  const log = useContext(LogContext);

  const variants = {
    intro: {
      opacity: 1,
      scale: 1,
      y: -20,
      x: 0,
      transition: { duration: 0.5, ease: 'easeInOut', delay: 0.5, type: 'spring', stiffness: 100, damping: 5 }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: -20,
      x: 0,
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      x: -30,
      transition: { duration: 0.1, ease: 'easeInOut', delay: 0 }
    },
  }

  return (
    
    <motion.div 
    animate={props.showCoachTip}
    initial="closed"
    variants={variants}
    style={{
      position:"fixed",
      bottom: "0px",
      left: "0px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100000,
    }}>
      {/*<div style={{
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:"white",
        borderRadius:"50%",
      }}>
        <span
          className="material-icons"
          style={{
            fontSize: "24px",
            fontWeight: "500",
            color: "#777",
            cursor: "pointer",
            //transform: "rotate(20deg)",
            marginLeft: "-3px"
          }}>
          back_hand
        </span>
      </div>*/}
      <div style={{
        position: "relative",
        //textAlign: "center",
        color: "#333",
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "#fff",
        borderRadius: "4px",
        marginLeft: "30px",
        boxShadow: "4px 8px 8px rgba(0, 0, 0, 0.13)",
        display:"flex",
        flexDirection:"row",
        alignItems:"center",
        gap:12,
        zIndex:2,
      }}>
        <span
          className="material-icons"
          style={{
            fontSize: "24px",
            fontWeight: "500",
            color: "#777",
            cursor: "pointer",
            //transform: "rotate(20deg)",
            //marginLeft: "-3px",
            zIndex: 10,
          }}>
          {props.icon}
        </span>
        <div style={{
          position: "absolute",
          left: "-16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
          borderRight: "16px solid #fff",
          zIndex: 10,
        }} />
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "40%",
          height: "0%",
          background: "#fff",
          zIndex: 1,
          pointerEvents: "none"
        }} />
        <span style={{zIndex: 2}}>{props.text}</span>
      </div>
    </motion.div>
   
  );
}

export default CoachTip;
