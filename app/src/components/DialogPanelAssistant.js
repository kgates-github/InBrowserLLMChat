import React, { useState, useEffect } from 'react';
import Supplement from './Supplement';
import '../App.css';
import '../Assistant.css';

function DialogPanelAssistant(props) {
  
  useEffect(() => {   
    console.log('props.supplement: ', props.supplement);
  }, [props.supplement]);

  return (
    <div style={{
      marginBottom:"20px", 
      display: props.message ? "block" : "none",
    }}>
      <div style={{
        display:"flex",
        flexDirection:"row",
        marginBottom:"0px",
      }}>
        <div style={{width:"38px",}}>
          <span 
            className="material-icons-outlined" 
            style={{
              fontSize: "24px",
              fontWeight: "500", 
              color: "#333", 
            }}>
            smart_toy
          </span>
        </div>
        <div style={{
          fontFamily:"Open Sans", 
          fontWeight:"600", 
          flex:1, 
          paddingTop:"2px",
        }}>
          Assistant
        </div>
      </div>
      <div style={{
        display:"flex",
        flexDirection:"row",
      }}>
        <div style={{width:"38px"}}></div>
        <div style={{fontFamily:"Source Sans Pro", flex:1, color:"#444", paddingRight:"20px"}}>
          <div ref={props.messageDivRef}>{props.message ? props.message : null}</div>
            {/* Supplements */}
              {props.supplement != null ? <Supplement spec={props.supplement} isActive={true}/> : null}
            {/* End Supplements */}
        </div>

       
      </div>
    </div>
  );
}

export default DialogPanelAssistant;

{/*



<div style={{
  display:"flex",
  flexDirection:"row",
  marginBottom:"4px",
}}>
  <div style={{width:"38px",}}>
    <span 
      className="material-icons-outlined" 
      style={{
        fontSize: "24px",
        fontWeight: "500", 
        color: "#333", 
      }}>
      smart_toy
    </span>
  </div>
  <div style={{
    fontFamily:"Open Sans", 
    fontWeight:"600", 
    flex:1, 
    paddingTop:"2px",
    }}>Assistant</div>
  </div>

  <div style={{
    display:"flex",
    flexDirection:"row",
  }}>
    <div style={{width:"38px"}}></div>
    <div style={{fontFamily:"Source Sans Pro", flex:1, color:"#444"}}>
      {message.length > 0 ? message : null} 
    </div>
</div>
*/}