import getLlmInference from './llm_inference';
import React, { useState, useEffect, useRef } from 'react';
import DialogPanelAssistant from './DialogPanelAssistant';
import DialogPanelUser from './DialogPanelUser';
import CoachTip from './CoachTip';
import UserInput from './UserInput';
import CloseTooltip from './CloseTooltip';
import { motion } from "framer-motion"
import '../App.css';
import '../Assistant.css';

let recognition = new window.webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = true; 

/*
Create a supplement object. It will fetch info (timer to fake it)
It will have a callback (createSupplement)
createSupplement will find id and add to the supplement object
*/

class ToDoItem {
  constructor(spec, callback) {
    this.spec = spec;
    this.spec.text = "This is a to-do item";
    this.spec.color = "#ff5500";
    this.spec.icon = "task";
    this.callback = callback;

    setTimeout(() => {
      this.callback(this.spec)
    }, Math.random() * 1000 + 1000);
  }
}

class InfoItem {
  constructor(spec, callback) {
    this.spec = spec;
    this.spec.text = "More information about this topic.";
    this.spec.color = "#0182DF";
    this.spec.icon = "info";
    this.callback = callback;

    setTimeout(() => {
      this.callback(this.spec)
    }, Math.random() * 1000 + 1000);
  }
}

class TaskItem {
  constructor(spec, callback) {
    this.spec = spec;
    this.spec.text = "Task in progrees";
    this.spec.color = "#5B5B5B";
    this.spec.icon = "schedule";
    this.callback = callback;

    setTimeout(() => {
      this.callback(this.spec)
    }, Math.random() * 1000 + 1000);
  }
}

class SupplementFetcher {
  constructor() {
    console.log('SupplementFetcher constructor');
  }

  fetchSupplement(spec, callback) {
    if (spec.type === "todo") {
      new ToDoItem(spec, callback);
    } else if (spec.type === "info") {
      new InfoItem(spec, callback);
    } else if (spec.type === "task") {
      new TaskItem(spec, callback);
    }
  }
}

const supplementFetcher = new SupplementFetcher(); 


function Assistant(props) {
  const [llmInference, setLlmInference] = useState(null);
  const [llmIsProcessing, setLlmIsProcessing] = useState(false);
  const [chatState, setChatState] = useState('dormant');
  const [chatDialog, setChatDialog] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [recognitionIsStarted, setRecognitionIsStarted] = useState(false);
  const [showCoachTip, setShowCoachTip] = useState(null);
  const [userInput, setUserInput] = useState(null);
  const [message, setMessage] = useState(null);
  const [chatPrompts, setChatPrompts] = useState("");
  const [showMicHint, setShowMicHint] = useState(true);
  const [supplementWindowState, setSupplementWindowState] = useState('dormant');
  const [curSupplement, setCurSupplement] = useState(null);


  /****************************************
    useRefs
  *****************************************/

  const chatStateRef = useRef(chatState);
  const chatDialogRef = useRef(chatDialog);
  const chatPromptsRef = useRef(chatPrompts);
  const llmIsProcessingRef = useRef(llmIsProcessing);
  const chatDialogDivRef = useRef(null);
  const messageDivRef = useRef(null);


  /****************************************
    Miscellaneous Functions
  *****************************************/

  function generateUUID() {
    return crypto.randomUUID();
  }

  const turnOnMic = () => {
    console.log('turnOnMic recognitionIsStarted: ', recognitionIsStarted);
    // Turn on mic and listen for speech
    if (!recognitionIsStarted) {
      recognition.stop();
      try {
        recognition.start();
        setRecognitionIsStarted(true);
        setMicActive(true);
        setShowMicHint(false);
      } catch (error) {
        console.log('Error starting recognition: ', error);
      }
    }
  }

  const closeChat = () => {
    recognition.stop();
    setChatState('dormant');
    setRecognitionIsStarted(false);
    setMicActive(false);
    toggleSupplementWindow('dormant', null);
  }

  const resetChat = () => {
    setChatDialog([]);
    setChatPrompts("");
    closeChat()
  }

  const manualSend = (text) => {
    sendQuestion(llmInference, text, chatPrompts);
  }

  function insertSupplement(spec) {
    console.log('insertSupplement: ', spec);

    setChatDialog(chatDialog => chatDialog.map(dialog => 
      dialog.id === spec.dialog_id ? {...dialog, supplement: spec} : dialog
    ));
  }

  function toggleSupplementIsCompleted(id) {
    setChatDialog(chatDialog => chatDialog.map(dialog => 
      dialog.id === id ? {...dialog, supplement: {...dialog.supplement, isCompleted: !dialog.isCompleted}} : dialog
    ));
  }

  function toggleSupplementWindow(state, spec) {
    // Hack to set height of supplement window
    let chatWindow = document.getElementById("chatWindow");
    let chatWindowHeight = chatWindow.offsetHeight - 60;
    let supplementWindow = document.getElementById("supplementWindow");
    supplementWindow.style.height = `${chatWindowHeight}px`;
    
    setSupplementWindowState(state);
    setCurSupplement(spec);
  }

  /****************************************
    LLM Inference
  *****************************************/
  let partialMessage = "";
 
  const displayPartialResults = (
    partialResults, 
    complete, 
  ) => {
    partialMessage += partialResults
    setMessage(partialMessage);
    //messageDivRef.current.innerHTML = partialMessage;
  
    if (complete) {
      setLlmIsProcessing(false);
      setMessage(null);
      //messageDivRef.current.innerHTML = "";

      const uuid = generateUUID();

      setChatDialog([
        ...chatDialogRef.current, 
        { 
          id: uuid,
          speaker: 'assistant', 
          message: partialMessage,
          supplement: null,
        }
      ]);

      // Simulate getting a supplement
      const types  = ["todo", "info", "task"];
      /*if (Math.random() > 0.5)  {
        supplementFetcher.fetchSupplement(
          {
            dialog_id: uuid,
            type: types[Math.floor(Math.random() * types.length)],
            text: "",
            isCompleted: false,
          },
          insertSupplement
        );
      }*/

      const prompt = `${chatPromptsRef.current}
      ${partialMessage}<end_of_turn>`

      setChatPrompts(prompt);
    }
  }

  function promptLLM(llmInference, userInput, chatPrompts) {
    partialMessage = ""; 
    let prompt = "";

    // If our prompt gets too long, reset it
    if (chatPrompts.length < 1000) {
      prompt += chatPrompts;
    } else {
      setChatPrompts("");
    }
    prompt += `<start_of_turn>user
      ${userInput}<end_of_turn>
      <start_of_turn>model`

    console.log('Prompt.length: ', prompt.length);

    setChatPrompts(prompt);
    setChatDialog([...chatDialog, {speaker: 'user', message: userInput}]);

    if (!llmIsProcessingRef.current) {
      try {
        setLlmIsProcessing(true);
        llmInference.generateResponse(
          prompt, 
          (partialResults, complete) => displayPartialResults(partialResults, complete)
        );
      } catch (error) {
        console.log('Error generating response: ', error);
      }
    }
  }

  function sendQuestion(llmInference, userInput, chatPrompts) { 
    const spans = document.querySelectorAll('.word');
    setMicActive(false);

    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.color = "#000";
      }, index * 140);
    });
    
    setTimeout(() => {
      setUserInput("");
      setShowMicHint(true);
      promptLLM(llmInference, userInput, chatPrompts) 
    }, (spans.length + 1) * 140);
  }


  /****************************************
    Speech recognition functions
  *****************************************/
  
  recognition.onresult = (e) => {
   
    if (chatState === 'ready') {
      setChatState('open');
    }
    const transcript = e.results[0][0].transcript;
    if (transcript != 'open') {
      setUserInput(transcript.charAt(0).toUpperCase() + transcript.slice(1));
    }
  };


  /****************************************
    Gesture Handlers
  *****************************************/

  const handleOpenPalm = (e) => {
    if (chatStateRef.current === 'dormant') {
      setChatState('ready');
    }
    
    turnOnMic();
  }

  const handleNoGesture = (e) => {
    if (chatStateRef.current === 'ready') {
      setChatState('dormant');
      setRecognitionIsStarted(false);
      setMicActive(false);
      setShowMicHint(true);
      recognition.stop();
    } else if (chatStateRef.current === 'open') {
      setMicActive(false);
      recognition.stop();
    }
  }

  /****************************************
    useEffects
  *****************************************/

  useEffect(() => { 
    props.subscribe("Open_Palm", (e) => handleOpenPalm(e));
    props.subscribe("No_Gesture", (e) => handleNoGesture(e));

    getLlmInference().then(result => {
      setLlmInference(result);
      setShowCoachTip("intro")
    }).catch(error => {
      console.log(error)
    });
  }, []);

  useEffect(() => {
    chatPromptsRef.current = chatPrompts;
  }, [chatPrompts]);

  useEffect(() => {
    chatStateRef.current = chatState;
  }, [chatState]);

  useEffect(() => {
    llmIsProcessingRef.current = llmIsProcessing;
  }, [llmIsProcessing]);

  useEffect(() => {
    chatDialogRef.current = chatDialog;
    chatDialogDivRef.current.scrollTop = chatDialogDivRef.current.scrollHeight;
  }, [chatDialog, message]);

  useEffect(() => {  
    if (llmInference != null) {
      // Set active here
      setIsLoaded(true); 
      
      recognition.onend = function(e) {
        recognition.stop();
        setRecognitionIsStarted(false);
        //if (chatState === 'ready') setChatState('dormant');
        if (userInput && userInput.length > 0) sendQuestion(llmInference, userInput, chatPrompts);
      };  
    }
  }, [llmInference, userInput, chatPrompts]);

  useEffect(() => {  
    if (isLoaded && chatState == 'dormant') {
      setShowCoachTip("intro")
    } else if (chatState === 'open') {
      setShowCoachTip('none')
    } else {
      setShowCoachTip('none')
    }
  }, [chatState, isLoaded]);

 
  

  /****************************************
    Animation variants
  *****************************************/

  const vaiantsChatWindowMain = {
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'circInOut' }
  },
  dormant: {
    x: -340,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

  const vaiantsSupplementWindow = {
    open: {
      x: 380,
      opacity: 1,
      transition: { duration: 0.3, ease: 'circInOut' }
    },

    dormant: {
      x: 12,
      opacity: 0,
      transition: { duration: 0.2, ease: 'circInOut' }
    }
  }

  /*
  ready: {
      x: -20,
      y: 20,
      opacity: 1,
      rotate: 0,
      width: 120,
      height: 120,
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0, }
    },
  */

  const vaiantsAssistantAvatar = {
    ready: {
      x: -20,
      y: 20,
      opacity: 1,
      width: 120,
      height: 120,
      transition: { duration: 0.3, ease: 'easeInOut', delay: 0, /*type: 'spring', stiffness: 600, damping: 20*/ }
    },
    dormant: {
      x: -40,
      y: 40,
      opacity: 0,
      rotate: 0,
      width: 40,
      height: 40,
      transition: { duration: 0.2, ease: 'backOut' }
    }
  }

  const vaiantsSpeechBubble = {
    ready: {
      x: 0,
      y: 0,
      opacity: [0, 1, 0],
      width: 120,
      height: 120,
      scale: [1, 2.2, 1],
      transition: {
        duration: 1.0, // duration of one cycle
        repeat: Infinity, // repeat the cycle indefinitely
        repeatType: "mirror",
      },
    },
    dormant: {
      x: -40,
      y: 40,
      opacity: 0,
      rotate: 0,
      width: 40,
      height: 40,
      //transition: { duration: 0.2, ease: 'backOut' }
    }
  }

  const variantsMic = {
    on: {
      opacity: 1,
      color: ["#eee", "#333"], // array of colors to cycle through
      transition: {
        duration: 0.3, // duration of one cycle
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
    <div className="deskTop" style={{
      background:"#E7EAEB",
      height:"100vh", 
      display:"flex",
      flexDirection:"column",
    }}>
      <CoachTip 
        icon={"back_hand"}
        text={'Raise your hand and say hello!'}
        showCoachTip={showCoachTip}
      />

      {/* Fake browser window */}

      <div style={{
        background:"#fff", 
        height:52, 
        display:"flex",
        flexDirection:"row",
        zIndex:3,
        borderBottom:"1px solid #ddd"
      }}>
        <img src={process.env.PUBLIC_URL + '/images/browser_left.png'} /> 
        <div style={{flex:1}}></div>
        <img src={process.env.PUBLIC_URL + '/images/browser_middle.png'} /> 
        <div style={{flex:1}}></div>
        <img src={process.env.PUBLIC_URL + '/images/browser_right.png'} /> 
      </div>

      <div 
        onClick={resetChat}
        style={{
          position:"fixed",
          bottom:"10px",
          right:"20px",
          cursor:"pointer",
        }}
      >
        <div style={{
          color:"#777", 
          fontSize:"12px", 
          textAlign:"center", 
          position:"relative",
          top:"-10px",
        }}>Reset</div>
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

      {/*<motion.div 
        style={{
          position: "absolute",
          bottom:"0px",
          background: "white", 
          zIndex: "10",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "120px",
          height: "120px",
          // boxShadow: "0px 12px 12px rgba(0, 0, 0, 0.5)",
        }}
        animate={chatState}
        initial="dormant"
        variants={vaiantsSpeechBubble}> 
      </motion.div>*/}

      <motion.div 
        style={{
          position: "absolute",
          bottom:"0px",
          background: "white", 
          zIndex: "10",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "40px",
          height: "40px",
          // boxShadow: "0px 12px 12px rgba(0, 0, 0, 0.5)",
        }}
        animate={chatState}
        initial="dormant"
        variants={vaiantsAssistantAvatar}>
          <motion.span 
            className="material-icons-outlined"  
            animate="on"
            initial="off"
            variants={variantsMic}
            style={{
              fontSize: "28px",
              fontWeight: "500", 
              color: "#666",
              cursor:"pointer",
            }}>
            mic
          </motion.span> 
      </motion.div>
      

      {/* Chat window */}
      <motion.div 
        id="chatWindow"
        style={{
          position: "relative",
          display: 'flex', 
          flexDirection: 'row', 
          height: '100vh',
          width: '460px',
          zIndex: "2",
          minHeight:"0px", 
          boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
        }}
        animate={chatState}
        initial="dormant"
        variants={vaiantsChatWindowMain}
      >
        <CloseTooltip 
          icon={"thumb_up"}
          chatState={chatState}
          setChatState={setChatState}
          subscribe={props.subscribe}
          text={'Close?'}
          // showCoachTip={showCoachTip === "intro" ? true : false}
        />
        {/* LEFT NAV CHAT WINDOW */}
        <div style={{
          width:60, 
          background:"#F4F4F4",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          gap:26,
          paddingTop:60,
          paddingBottom: 40
        }}>
          <div style={{
              background:"#fff", 
              width:38, height:38,
              borderRadius:"6px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
          }}>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              chat
            </span>
          </div>
          <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              info
            </span>
          </div>
          <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              task
            </span>
          </div>
          <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              search
            </span>
          </div>
          <div style={{flex:1}}/>
           <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              settings
            </span>
          </div>
           <div>
            <span 
              className="material-icons-outlined" 
              style={{
                fontSize: "24px",
                fontWeight: "500", 
                color: "#888888", 
              }}>
              account_circle
            </span>
          </div>
          {/*
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
          */}

        </div>
        <div 
          className="chat-window-main"
          style={{
            display:"flex",
            flexDirection:"column",
            position: "relative",
            background: "white",
            minHeight:"0px", 
            //boxShadow: "8px 0px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{justifyContent:"flex-end", display:"flex", height:"34px", background:"white"}}>
            <span 
              onClick={closeChat}
              className="material-icons" 
              style={{
                fontSize: "20px",
                fontWeight: "500", 
                color: "#999",
                cursor:"pointer",
                marginTop:8,
              }}>
              close
            </span>
          </div>
          <div 
            id="chat-dialog"
            class="custom-scroll"
            ref={chatDialogDivRef}
            style={{
              flex:1, 
              overflowY:"auto",
              overflowX: "visible",
              minHeight:"0px", 
            }}
          >
          <div style={{
            position:"absolute", 
            top:"36px", 
            left:"0px", 
            width:"360px", 
            height:"30px", 
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))"
          }}></div>
          <div style={{
            position:"absolute", 
            bottom:"82px", 
            left:"0px", 
            width:"360px", 
            height:"30px", 
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))"
          }}></div>

            <div style={{height:"20px"}}></div>
            {chatDialog.map((dialog, index) => {
              if (dialog.speaker === "user") {
                return <DialogPanelUser key={"user_dialog_"+index} message={dialog.message}/>;
              } else if (dialog.speaker === "assistant") {
                return <DialogPanelAssistant 
                          key={dialog.id} 
                          message={dialog.message} 
                          supplement={dialog.supplement}
                          toggleSupplementWindow={toggleSupplementWindow}
                          toggleSupplementIsCompleted={toggleSupplementIsCompleted}
                        />;
              }
            })}
            <DialogPanelAssistant 
              message={message}
              messageDivRef={messageDivRef}
              toggleSupplementWindow={toggleSupplementWindow}
              toggleSupplementIsCompleted={toggleSupplementIsCompleted}
            />
          </div>
          <UserInput 
            sendQuestion={sendQuestion} 
            userInput={userInput} 
            micActive={micActive} 
            setMicActive={setMicActive}
            manualSend={manualSend}
            showMicHint={showMicHint}
            chatDialog={chatDialog}
          />
        </div>
      </motion.div>
      
      {/* Drawer window */}
      <motion.div 
        id="supplementWindow"
        animate={supplementWindowState}
        initial="dormant"
        variants={vaiantsSupplementWindow}
        style={{
          position: "absolute",
          zIndex: "1",
          top: "150px",
          display: "flex",
          flexDirection: "column",
          width: "350px",
          height: "896px",
          //background: "red",
          boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
          //border: "5px solid #9AA7B8",
          //paddingTop: "12px",
          //paddingBottom: "12px",
          paddingLeft: "32px",
          paddingRight: "12px",
        }}
      >
        <div style={{justifyContent:"flex-end", display:"flex", height:"24px", background:"white"}}>
          <span 
            onClick={() => toggleSupplementWindow('dormant', null)}
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
        <div style={{
          flex:1,
          background:"white",
        }}>
          {curSupplement && (

            <div 
              style={{
                display: "flex",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",}}
            >
              <div style={{
                marginRight:"8px",
                width: "32px",
                height: "32px",
                background: curSupplement.color,
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
                  }}
                >
                  {curSupplement.isCompleted ? 'check' : curSupplement.icon}
                </span>
              </div>
              <div style={{
                flex:"1",
                fontFamily:"Open Sans", 
                fontSize:"16px",
                fontWeight:"400", 
                color:"#333",
                textDecoration: curSupplement.isCompleted ? "line-through" : "none",
              }}>
                {curSupplement.text}
              </div>
            </div>
          )}
         
        </div>
        <button 
          onClick={() => toggleSupplementIsCompleted(curSupplement.dialog_id)}
        style={{
          backgroundColor: '#666',
          border: 'none',
          color: 'white',
          padding: '8px 32px',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-block',
          fontSize: '16px',
          margin: '4px 2px',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>
          Done
        </button>

      </motion.div>
      {/* End drawer window */}
      
    </div>
  );
}

export default Assistant;