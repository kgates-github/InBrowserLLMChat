import React, { useContext, useEffect, useState } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';

const highlightColor = '#f4f4f4'

function CloseTooltip(props) {
  const [tipState, setTipState] = useState('closed');
  const [progressBarState, setProgressBarState] = useState('dormant');
  const log = useContext(LogContext);

  const variants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.6, ease: 'easeInOut', delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      y: 0,
      x: -30,
      transition: { duration: 0.1, ease: 'easeInOut', delay: 0 }
    },
  }

  const progressBarVariants = {
    dormant: {
      width:"0%",
    },
    animate: {
      width:"100%",
      transition: { duration: 0.4, ease: 'linear', }
    },
  }

  const handleAnimationComplete = () => {
    setTimeout(() => {props.setChatState('dormant')}, 300);
    setTimeout(() => {setProgressBarState('dormant')}, 500);
  }

  const handleThumbUp = (e) => {
    setProgressBarState('animate');
  }

  useEffect(() => { 
    props.subscribe("Thumb_Up", (e) => handleThumbUp(e));
    setProgressBarState('dormant');
  }, []);

  useEffect(() => { 
    setTipState(props.chatState)
  }, [props.chatState]);

  return (
    
    <motion.div 
    animate={tipState}
    initial="closed"
    variants={variants}
    style={{
      position:"absolute",
      top: "8px",
      left: "458px",
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
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: "12px",
        paddingRight: "12px",
        background: "#fff",
        borderRadius: "4px",
        marginLeft: "30px",
        boxShadow: "4px 8px 8px rgba(0, 0, 0, 0.13)",
        display: "inline-flex",
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
          borderRight: `16px solid ${progressBarState=='animate'? highlightColor : 'white'}`,
          zIndex: 10,
        }} />
        <motion.div 
        animate={progressBarState}
        initial="dormant"
        variants={progressBarVariants}
        onAnimationComplete={handleAnimationComplete}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "40%",
          height: "100%",
          background: highlightColor,
          zIndex: 1,
          pointerEvents: "none"
        }} />
        <span style={{zIndex: 2, whiteSpace: 'nowrap'}}>{props.text}</span>
      </div>
    </motion.div>
   
  );
}

export default CloseTooltip;
