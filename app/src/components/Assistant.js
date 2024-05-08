import getLlmInference from './llm_inference';
import React, { useState, useEffect, useRef } from 'react';
import DialogPanelAssistant from './DialogPanelAssistant';
import DialogPanelUser from './DialogPanelUser';
import CoachTip from './CoachTip';
import UserInput from './UserInput';
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
      if (Math.random() > 0.5)  {
        supplementFetcher.fetchSupplement(
          {
            dialog_id: uuid,
            type: types[Math.floor(Math.random() * types.length)],
            text: "",
            isCompleted: false,
          },
          insertSupplement
        );
      }

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
    setUserInput(transcript.charAt(0).toUpperCase() + transcript.slice(1));
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

  const handleThumbUp = (e, setChatIsOpen) => {
    console.log('handleThumbUp');
    setChatIsOpen(false)
  }


  /****************************************
    useEffects
  *****************************************/

  useEffect(() => { 
    props.subscribe("Open_Palm", (e) => handleOpenPalm(e));
    props.subscribe("No_Gesture", (e) => handleNoGesture(e));

    getLlmInference().then(result => {
      setLlmInference(result);
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

  const vaiantsAssistantAvatar = {
    ready: {
      x: -1,
      y: 70,
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.2, ease: 'easeInOut', delay: 0, type: 'spring', stiffness: 600, damping: 20 }
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
        text2={'Raise your hand and say hello!'}
        showCoachTip={showCoachTip === "intro" ? true : false}
      />

      {/* Fake desktop */}
      <div style={{
        width:"100%",
        height:"38px",
        background:"#454645",
        display:"flex",
        flexDirection:"row",
      }}>
        <div>
          <img src={process.env.PUBLIC_URL + '/images/menu_bar_1.png'} 
            alt="Menu bar" 
            style={{width:'380px', height:'26px', marginTop:"5px", marginLeft:"10px"}}
          />
        </div>
        <div style={{flex:1}}></div>
        <div>
          <img src={process.env.PUBLIC_URL + '/images/menu_bar_2.png'} 
            alt="Menu bar" 
            style={{width:'558px', height:'23px', marginTop:"6px", marginRight:"4px"}}
          />
        </div>
      </div>
      <div 
        onClick={resetChat}
        style={{
          position:"fixed",
          top:"104px",
          right:"10px",
          cursor:"pointer",
        }}
      >
        <img src={process.env.PUBLIC_URL + '/images/folder.png'} 
        alt="Menu bar" 
        style={{width:'83px', height:'68px',}}
        />
        <div style={{
          color:"#fff", 
          fontSize:"12px", 
          textAlign:"center", 
          position:"relative",
          top:"-10px",
        }}>Reset</div>
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
          zIndex: "10",
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
        id="chatWindow"
        style={{
          position: "relative",
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          width: '420px',
          zIndex: "2",
          minHeight:"0px", 
        }}
        animate={chatState}
        initial="dormant"
        variants={vaiantsChatWindowMain}
      >
        <div 
          className="chat-window-main"
          style={{
            display:"flex",
            flexDirection:"column",
            position: "relative",
            background: "white",
            minHeight:"0px", 
            boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{justifyContent:"flex-end", display:"flex", height:"24px", background:"white"}}>
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
          <div 
            id="chat-dialog"
            ref={chatDialogDivRef}
            style={{
              flex:1, 
              overflowY:"scroll",
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
            bottom:"150px", 
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
          top: "50px",
          display: "flex",
          flexDirection: "column",
          width: "350px",
          height: "896px",
          background: "white",
          boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.5)",
          borderRadius: "20px",
          border: "5px solid #9AA7B8",
          paddingTop: "12px",
          paddingBottom: "12px",
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
          borderRadius: '12px'
        }}>
          Done
        </button>

      </motion.div>
      {/* End drawer window */}
      
    </div>
  );
}

export default Assistant;