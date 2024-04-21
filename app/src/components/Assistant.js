import getLlmInference from './llm_inference';
import React, { useState, useEffect } from 'react';
import DialogPanelAssistant from './DialogPanelAssistant';
import CoachTip from './CoachTip';
import { motion } from "framer-motion"
import '../App.css';
import '../Assistant.css';

let recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US'; // Set language
recognition.interimResults = true; // Get interim results

function Assistant(props) {
  const [llmInference, setLlmInference] = useState(null);
  const [message, setMessage] = useState(null);
  const [chatState, setChatState] = useState('dormant');
  const [isLoaded, setIsLoaded] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [recognitionIsStarted, setRecognitionIsStarted] = useState(false);
  const [showCoachTip, setShowCoachTip] = useState(null);

  const openCommands = [
    "hey", "hey there", "hello there", "dude", "hello"
  ];

  /****************************************
    Miscellaneous Functions
  *****************************************/

  const closeChat = () => {
    recognition.stop();
    setChatState('dormant');
    setRecognitionIsStarted(false);
    setMicActive(false);
  }

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
    Speech recognition functions
  *****************************************/

  const checkForCommand = (transcript) => {
    for (let i = 0; i < openCommands.length; i++) {
      if (transcript.includes(openCommands[i])) {
        return true;
      }
    }
    return false;
  }
  
  recognition.onresult = event => {
    if (chatState === 'ready') {
      console.log('event.results[0][0].transcript', event.results[0][0].transcript)
      if (checkForCommand(event.results[0][0].transcript)) {
        // If we are opening chat, set mic active as default
        setChatState('open');
        setMicActive(true);
      }
    } else if (chatState === 'open' && micActive) {
      console.log('For speech recognition transcript', event.results[0][0].transcript)
    }
    //const transcript = event.results[0][0].transcript;
    //props.setTranscription(transcript.charAt(0).toUpperCase() + transcript.slice(1));
  };

  recognition.onend = () => {
    recognition.stop();
    setRecognitionIsStarted(false);

    setMicActive(false);
    if (chatState === 'ready') setChatState('dormant');
  };

  /****************************************
    Gesture Handlers
  *****************************************/

  const handleOpenPalm = (e) => {
    console.log('handleOpenPalm -----------------------');
    
    if (chatState === 'dormant') {
      // Turn on mic and listen for speech
      recognition.stop();
      if (!recognitionIsStarted) recognition.start();
      setRecognitionIsStarted(true)
      setChatState('ready');
    }
    props.subscribe("No_Gesture", (e) => handleNoGesture(e));
  }

  const handleNoGesture = (e) => {
    console.log('handleNoGesture');
    
    setRecognitionIsStarted(false);
    setMicActive(false);
    recognition.stop();
    if (chatState === 'ready') setChatState('dormant');
  }

  const handleThumbUp = (e, setChatIsOpen) => {
    console.log('handleThumbUp');
    setChatIsOpen(false)
  }

  /****************************************
    useEffects
  *****************************************/

  useEffect(() => { 
    /*
    chatIsOpen, setChatIsOpen, 
    isLoaded, setIsLoaded, 
    micActive, setMicActive
    recognitionIsStarted, setRecognitionIsStarted 
    */
    props.subscribe("Open_Palm", (e) => 
      handleOpenPalm(e)
    );

    getLlmInference().then(result => {
      setLlmInference(result);
    }).catch(error => {
      console.log(error)
    });
  }, []);

  useEffect(() => {  
    if (llmInference != null) {
      // Set active here
      setIsLoaded(true); 
      setShowCoachTip("intro")
      setMessage("How can I help you today?");
    }
  } , [llmInference]);

  useEffect(() => {  
    if (isLoaded && chatState === 'dormant') {
      setShowCoachTip('intro')
    } else {
      setShowCoachTip(null)
    }
  } , [chatState, isLoaded]);
  
  useEffect(() => {  
    if (isLoaded) {
      setShowCoachTip('intro')
    }
  } , [isLoaded]);

  /****************************************
    Animation variants
  *****************************************/

  const vaiantsChatWindowMain = {
    open: {
      x: 12,
      opacity: 1,
      transition: { duration: 0.3, ease: 'circInOut' }
    },

    dormant: {
      x: -340,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  const vaiantsAssistantAvatar = {
    ready: {
      x: -2,
      y: 70,
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.2, ease: 'backOut' }
    },
    dormant: {
      x: -36,
      y: 70,
      opacity: 0,
      rotate: 0,
      transition: { duration: 0.2, ease: 'backOut' }
    }
  }
 
  return (
    <div className="deskTop" style={{
      background:"#545454",
      height:"100vh", 
      display:"flex",
      flexDirection:"column",
    }}>
      <CoachTip 
        image={"icon_palm_open"} 
        text1={''}
        text2={'Raise your hand and say "hey!"'}
        showCoachTip={showCoachTip == "intro"}
      />
      <div style={{
        width:"100%",
        height:"40px",
        background:"#454645",
      }}>
        <img src={process.env.PUBLIC_URL + '/images/menu_bar_1.png'} 
        alt="Menu bar" 
        style={{width:'380px', height:'26px', marginTop:"6px", marginLeft:"4px"}}
      />
      </div>
      <div style={{
        position:"fixed",
        top:"104px",
        right:"10px",
      }}>
        <img src={process.env.PUBLIC_URL + '/images/folder.png'} 
        alt="Menu bar" 
        style={{width:'83px', height:'68px',}}
      />
      </div>

      <div style={{
        position:"fixed",
        top:"194px",
        right:"10px",
      }}>
        <img src={process.env.PUBLIC_URL + '/images/folder.png'} 
        alt="Menu bar" 
        style={{width:'83px', height:'68px',}}
      />
      </div>

      {/* LLM Loader */}
      <div style={{
        position:"fixed",
        top:"0px",
        left:"0px", 
        width:"100%",
        height:"100%",
        background:"rgb(0,10,30,0.5)",
        display: isLoaded ? "none" : "flex",
        justifyContent:"center",
        alignItems:"center",
        color:"#fff",
      }}>
        Starting LLM Inference...
      </div>

      {/* Avatar */}
      <motion.div 
        style={{
          position: "absolute",
          background: "white", 
          paddingTop: "4px",
          paddingRight: "8px",
          paddingBottom: "6px", 
          width: "28px", 
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
          boxShadow: "0px 12px 12px rgba(0, 0, 0, 0.5)",
        }}
        animate={chatState}
        initial="dormant"
        variants={vaiantsAssistantAvatar}>
        <div style={{justifyContent:"flex-end", alignContent:"center", display:"flex",}}>
          <span 
            onClick={closeChat}
            className="material-icons-outlined" 
            style={{
              fontSize: "28px",
              fontWeight: "500", 
              color: "#333",
              cursor:"pointer",
              transform: "rotate(20deg)",
            }}>
            smart_toy
          </span>
        </div>
        <div style={{
          position:"absolute", 
          top:"-8px", 
          left:"40px", 
          color:"#fff", 
          fontSize:"20px",
          fontWeight:"600",
        }}>?</div>
      </motion.div>

      {/* Chat window */}
      <motion.div 
        className="chat-window-main"
        animate={chatState}
        initial="dormant"
        variants={vaiantsChatWindowMain}>
        <div style={{justifyContent:"flex-end", display:"flex", marginBottom:"20px"}}>
          <span 
            onClick={closeChat}
            className="material-icons" 
            style={{
              fontSize: "20px",
              fontWeight: "500", 
              color: "#333",
              cursor:"pointer",
            }}>
            close
          </span>
        </div>
        <div style={{flex:1, background:"none"}}>
          <DialogPanelAssistant message={message}/>
        </div>
        <div 
          onClick={sendQuestion}
          style={{
            height:"80px", 
            background:"#fff", 
            border: "1px solid #AEBBCC", 
            padding:"12px",
            marginBottom:"12px",
            borderRadius:"4px",
        }}>
          <span className="material-icons" style={{ fontSize: "20px", color: "#222" }}>
            mic
          </span>
        </div>
        
        <div onClick={sendQuestion}
          style={{
            display: "flex",
            cursor:"pointer",
            height:"40px", 
            backgroundd:"yellow", 
            alignContent:"center", 
            justifyContent:"center"}}>
          <span 
            className="material-icons-outlined" 
            style={{
              fontSize: "26px",
              fontWeight: "500", 
              color: "#333", 
            }}>
            message
          </span>
        </div>
        
      </motion.div>
    </div>
  );
}

export default Assistant; 