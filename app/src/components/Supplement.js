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
      //transition: { duration: 0.5, ease: 'backOut',}
      transition: { duration: 0.4, ease: 'easeInOut', type: 'spring', stiffness: 600, damping: 30 }
    },
    dormant: {
      x: 0,
      y: -20,
      scale: 0,
      opacity: 0,
      //transition: { duration: 3, ease: 'easeInOut', delay: 1, type: 'spring', stiffness: 600, damping: 20 }
    }
  }

  return (
    <div style={{position:"relative", overflow:"visible", marginBottom:20}}>
      <motion.div 
        animate={props.isActive ? "open" : "dormant"}
        initial="dormant"
        variants={vaiants}
        style={{padding:"0px", marginTop:"20px", marginBottom:"10px", cursor:"pointer"}}
      >
        <div 
          onClick={() => { 
            props.toggleSupplementWindow('open', props.spec);
            //props.toggleSupplementIsCompleted(props.spec.dialog_id);
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingTop: "0px",
            paddingBottom: "0px",
            background: "#333", 
            borderRadius: "12px",
            height: "48px",
            alignItems: "center",
            marginRight:32,
          }}
        >
          <div style={{
            marginRight:"8px",
            width: "22px",
            height: "22px",
            background: "#333", //props.spec.color,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "18px",
                fontWeight: "400", 
                color: "#fff", 
              }}
            >
              {props.spec.isCompleted ? 'check' : props.spec.icon}
            </span>
          </div>
          
          <div style={{
            flex:"1",
            fontFamily:"Open Sans", 
            fontSize:"14px",
            fontWeight:"400", 
            color:"#fff",
            textDecoration: props.spec.isCompleted ? "line-through" : "none",
          }}>
            {props.spec.text}
          </div>
          
          <div style={{
            marginLeft:"8px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
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
        </div>
      </motion.div>
      
    </div>
  );
}

export default Supplement;
