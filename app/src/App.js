import './App.css';
import GestureCapturer from './components/GestureCapturer';
import Log from './components/Log';
import React, { useState } from 'react';
import { LogContext } from './components/LogContext';
import Assistant from './components/Assistant';

function App() {
  const userAgent = navigator.userAgent;
  const [logEntries, setLogEntries] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [introDisplay, setIntroDisplay] = useState('none');

  const log = (entry) => {
    setLogEntries(prevEntries => [...prevEntries, entry]);
  }

  // Set up our custom gesture events
  const subscribe = (eventName, listener) => {
    log('Subscribing to ' + eventName);
    document.addEventListener(eventName, listener);
  }
  
  const unsubscribe = (eventName, listener) => {
    log('Unsubscribing from ' + eventName);
    document.removeEventListener(eventName, listener);
  }
  
  const publish = (eventName, data) => {
    const event = new CustomEvent(eventName, { detail: data });
    //console.log('publishing event', eventName, data);
    document.dispatchEvent(event);
  }

  return (
    <LogContext.Provider value={log}>
    { (userAgent.indexOf("Chrome") > -1) ? 
      <>
        <GestureCapturer 
          publish={publish} 
          setIsLoaded={setIsLoaded} 
          introDisplay={introDisplay}
          setIntroDisplay={setIntroDisplay}
        />
        <div className="header" style={{position:"fixed", top:0, left:0}}>
          <div style={{flex:1}}></div>
          <div className="title">
            <div className="header-06" style={{color:"white"}}>Agentic I</div>
          </div>
          <div style={{flex:1}}></div>
        </div>
        {isLoaded ? <Assistant
          subscribe={subscribe} 
          unsubscribe={unsubscribe} 
          setIntroDisplay={setIntroDisplay}/> : null}
        {/*<Log entries={logEntries}/>*/}
      </>
     : <div style={{padding: "20px", textAlign:"center"}}>This app is only supported in Google Chrome</div> }
    </LogContext.Provider>
  );
}

export default App;
