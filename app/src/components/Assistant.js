import getLlmInference from './llm_inference';
import React, { useState, useEffect, useRef } from 'react';
import DialogPanelAssistant from './DialogPanelAssistant';
import CoachTip from './CoachTip';
import UserInput from './UserInput';
import { motion } from "framer-motion"
import '../App.css';
import '../Assistant.css';

let recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US'; // Set language
recognition.interimResults = true; // Get interim results

function Assistant(props) {
  const [llmInference, setLlmInference] = useState(null);
  const [llmIsProcessing, setLlmIsProcessing] = useState(false);
  const [chatState, setChatState] = useState('dormant');
  const [isLoaded, setIsLoaded] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [recognitionIsStarted, setRecognitionIsStarted] = useState(false);
  const [showCoachTip, setShowCoachTip] = useState(null);
  const [userInput, setUserInput] = useState(null);
  const [message, setMessage] = useState("");
  const [chatPrompts, setChatPrompts] = useState("");


  /****************************************
    Miscellaneous Functions
  *****************************************/

  const closeChat = () => {
    recognition.stop();
    setChatState('dormant');
    setRecognitionIsStarted(false);
    setMicActive(false);
  }

  function getSetChatPrompts() {
    return setChatPrompts;
  }

  /****************************************
    LLM Inference
  *****************************************/
  let partialMessage = "";
 
  const displayPartialResults = (
    partialResults, 
    complete, 
    chatPrompts,
  ) => {
    partialMessage += partialResults
    setMessage(partialMessage);
  
    if (complete) {
      //const setChatPrompts = getSetChatPrompts();

      const prompt = `${chatPrompts}
      ${partialMessage}<end_of_turn>`

      setChatPrompts(prompt);
    }
  }

  function sendQuestion(llmInference, userInput, chatPrompts) { 
    partialMessage = ""; 
    
    const prompt = `${chatPrompts}
    <start_of_turn>user
    ${userInput}<end_of_turn>
    <start_of_turn>model`

    console.log('/n*********************')
    console.log('prompt', prompt)
    console.log('*********************/n')

    setChatPrompts(prompt);

    llmInference.generateResponse(prompt, (partialResults, complete, chatPrompts) => displayPartialResults(partialResults, complete, chatPrompts));
  }

  /****************************************
    Speech recognition functions
  *****************************************/
  
  recognition.onresult = (e) => {
    if (chatState === 'ready') {
      setChatState('open');
    }
    const transcript = e.results[0][0].transcript;
    setUserInput(transcript.charAt(0).toUpperCase() + transcript.slice(1));
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
      setRecognitionIsStarted(true);
      setMicActive(true);
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
      setShowCoachTip("intro");

      recognition.onend = function(e) {
        recognition.stop();
        setRecognitionIsStarted(false);
        setMicActive(false);
        if (chatState === 'ready') setChatState('dormant');
        sendQuestion(llmInference, userInput, chatPrompts);
      };  
    }
  } , [llmInference, userInput, chatPrompts]);

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
      x: -1,
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
        text2={'Raise your hand and say something...'}
        showCoachTip={showCoachTip == "intro"}
      />

      {/* Fake desktop */}
      <div style={{
        width:"100%",
        height:"38px",
        background:"#454645",
      }}>
        <img src={process.env.PUBLIC_URL + '/images/menu_bar_1.png'} 
        alt="Menu bar" 
        style={{width:'380px', height:'26px', marginTop:"5px", marginLeft:"4px"}}
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
        <UserInput sendQuestion={sendQuestion} userInput={userInput} micActive={micActive} />
      </motion.div>
    </div>
  );
}

export default Assistant; 