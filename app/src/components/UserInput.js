import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion"
import { LogContext } from './LogContext';


function UserInput(props) {
  const log = useContext(LogContext);
  const [isManualMode, setIsManualMode] = useState(false);
  const [numTasks, setNumTasks] = useState(0);
  const [numTodos, setNumTodos] = useState(0);
  const divRef = useRef(null);

  const manualSend = () => {
    const text = divRef.current.innerText;
    props.manualSend(text);
    divRef.current.innerText = "";
  }

  const formatTranscription = (transcription) => {
    const words = transcription.split(' ');
    
    return words.map((word, index) => {
      return (
        <span 
          className='word'
          style={{color:"#999"}} 
          key={index}>{word} </span>
      );
    });
  }

  useEffect(() => {
    if (isManualMode && divRef.current) {
      divRef.current.focus();
    } else if (!isManualMode && divRef.current) {
      divRef.current.blur();
    }
  }, [isManualMode]);

  useEffect(() => {
    if (props.chatDialog) {
      const numTodos = props.chatDialog.filter(
        (dialog) => dialog.speaker == "assistant" && 
                    dialog.supplement && 
                    dialog.supplement.type == "todo" &&
                    !dialog.supplement.isCompleted
      ).length;
      const numTasks = props.chatDialog.filter(
        (dialog) => dialog.speaker == "assistant" && 
                    dialog.supplement && 
                    dialog.supplement.type == "task" &&
                    !dialog.supplement.isCompleted
      ).length;
      setNumTasks(numTasks);
      setNumTodos(numTodos);
    }
  }, [props.chatDialog]);

  useEffect(() => {
    console.log("UserInput props.micActive: " + props.micActive)
  }, [props.micActive]);

  const variantsMic = {
    on: {
      opacity: 1,
      color: ["#eee", "#000"], // array of colors to cycle through
      transition: {
        duration: 0.2, // duration of one cycle
        repeat: Infinity, // repeat the cycle indefinitely
        repeatType: "reverse",
      },
    },
    off: {
      opacity: 1,
      color: "#ccc", // static color when not blinking
    },
  }

  return (
    <div 
      onMouseEnter={() => {
        setIsManualMode(true); 
        //props.setMicActive(false)
      }}
      onMouseLeave={() => {
        setIsManualMode(false)
        //props.setMicActive(true)
      }}
    >
      <div
        style={{
          minHeight:"32px", 
          background:"white", 
          border: "1px solid #AEBBCC", 
          padding:"8px",
          marginBottom:"12px",
          borderRadius:"12px",
      }}>
        {/* Hint */}
        <div style={{ 
          position:"absolute", 
          width:"340px", 
          minHeight:"32px",
          backgroundColor:"none",
          display: !props.showMicHint || isManualMode ? "none" : "flex",
          justifyContent:"center",
          alignItems:"center",
          paddingTop:"2px",
        }}> 
          {/*<img src={process.env.PUBLIC_URL + '/svg/coachtip_hand_mic.svg'} 
            alt="open hand = mic" 
            style={{width:'auto', height:'auto',}}
          />*/}
        </div>
        
        {/* Text */}
        <div 
          id="audioInput"
          style={{
            float:"left", 
            width:"20px", 
            height:"20px", 
            borderRadius:"50%", 
            background:"none", 
            marginRight:"8px",
            marginTop:"7px",
            display: props.micActive ? "block" : "block",
          }}
        >
          <motion.span 
            className="material-icons" 
            animate={props.micActive ? "on" : "off"}
            initial="off"
            variants={variantsMic}
            style={{
              fontSize: "24px", 
            }}>
            mic
          </motion.span> 
        </div>
        <div style={{paddingTop:"7px",}}>
          {(props.userInput && props.userInput.length > 0) ? 
            formatTranscription(props.userInput) 
            : 
            "" 
          }
        </div>
        <div 
        ref={divRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevents the addition of a new line
            manualSend();
          }
        }}
        contentEditable={isManualMode}
        style={{
          position:"absolute",
          width:"340px", 
          minHeight:"32px",  
          background:"white",
          display: isManualMode ? "block" : "none",
        }}></div>
      </div>

      <div 
        style={{
          display: "flex",
          cursor:"pointer",
          height:"40px", 
          paddingLeft:"6px",
          paddingRight:"6px",
          justifyContent:"space-between",
        }}
      >
        <div style={{background:"none", display: "flex", alignItems:"flex-start", width:"50px", background:"none"}}>
          <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: numTodos > 0 ? "#333" : "#ddd", 
              }}>
              task
            </span>
          </div>
          <div style={{background:"none", marginTop:"3px", marginLeft:"2px"}}>
            {numTodos > 0 ? numTodos : ""}
          </div>
        </div>
        {isManualMode ? (
          <span 
            className="material-icons" 
            onClick={() => manualSend()}
            style={{
              fontSize: "24px",
              fontWeight: "500", 
              color: "#333", 
              cursor:"pointer",
            }}>
            send
          </span>
        ) : (
          <span
            className="material-icons-outlined" 
            style={{
              fontSize: "24px",
              fontWeight: "500", 
              color: "#333", 
            }}>
            chat
          </span>
        )}
        <div style={{background:"none", display: "flex", alignItems:"flex-start", width:"50px", background:"none"}}>
          <div style={{flex:1}}></div>
          <div style={{background:"none", marginTop:"3px", marginRight:"2px"}}>
          {numTasks > 0 ? numTasks : ""}  
          </div>
          <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: numTasks > 0 ? "#333" : "#ddd", 
              }}>
              schedule
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserInput;
