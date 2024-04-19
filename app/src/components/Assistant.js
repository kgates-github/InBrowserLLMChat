import getLlmInference from './llm_inference';
import React, { useState, useEffect } from 'react';
import DialogPanel from './DialogPanel';
import { motion } from "framer-motion"
import '../App.css';
import '../Assistant.css';

function Assistant(props) {
  const [llmInference, setLlmInference] = useState(null);
  const [message, setMessage] = useState(null);
  const [chatIsOpen, setChatIsOpen] = useState(false);


  /****************************************
    LLM Inference
  *****************************************/
  let partialMessage = "";
 
  const displayPartialResults = (partialResults, complete)  =>{
    partialMessage += partialResults
    setMessage(partialMessage);
  
    if (complete) {
      if (!message) {
        console.log("Empty message");
      }
    }
  }
  const sendQuestion = () => { 
    partialMessage = "";
    const prompt = `Who is Buckminster Fuller?`
    
    llmInference.generateResponse(prompt, displayPartialResults);
  }

  /****************************************
    Gesture Handlers
  *****************************************/

  const handleOpenPalm = (e, setChatIsOpen) => {
    //console.log('handleOpenPalm isInSelectionMode' + isInSelectionMode);
    setChatIsOpen(true)
    props.subscribe("No_Gesture", (e) => handleNoGesture(e, setChatIsOpen));
    props.subscribe("Thumb_Up", (e) => handleThumbUp(e, setChatIsOpen));
  }

  const handleNoGesture = (e, setChatIsOpen) => {
    console.log('handleNoGesture');
    //setChatIsOpen(false)
  }

  const handleThumbUp = (e, setChatIsOpen) => {
    console.log('handleThumbUp');
    setChatIsOpen(false)
  }

  /****************************************
    useEffects
  *****************************************/


  useEffect(() => {   
    props.subscribe("Open_Palm", (e) => handleOpenPalm(e, setChatIsOpen));

    getLlmInference().then(result => {
      setLlmInference(result);
    }).catch(error => {
      console.log(error)
    });
  }, []);

  useEffect(() => {   
    if (llmInference != null) {
      // Set active here
      setMessage("How can I help you today?");
    }
  } , [llmInference]);


  /****************************************
    Animation variants
  *****************************************/

  const vaiantChatWindowMain = {
    open: {
      x: 20,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    closed: {
      x: -440,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }
 
  return (
    <div className="deskTop" style={{
      background:"#545454",
      height:"100vh", 
      display:"flex",
      flexDirection:"column",
    }}>
      <div style={{
        width:"100%",
        height:"40px",
        background:"#454645",
      }}></div>
      <motion.div 
        className="chat-window-main"
        animate={chatIsOpen ? "open" : "closed"}
        initial="closed"
        variants={vaiantChatWindowMain}>
        <div style={{flex:1}}>
          <DialogPanel message={message}/>
        </div>
        <div onClick={sendQuestion}
          style={{
            cursor:"pointer",
            height:"40px", 
            backgroundd:"yellow", 
            display:"flex", 
            alignContent:"center", 
            justifyContent:"center"}}>
          <span 
            className="material-icons" 
            style={{
              fontSize: "24px",
              fontWeight: "500", 
              color: "#333", 
            }}>
            send
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default Assistant;