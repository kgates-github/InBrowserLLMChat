import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState, useContext } from 'react';
import getLlmInference from './llm_inference';

function App() {
  const [llmInference, setLlmInference] = useState(null);
  const [message, setMessage] = useState("");
  let partialMessage = "";

  const displayPartialResults = (partialResults, complete)  =>{
    partialMessage += partialResults
    setMessage(partialMessage);
  
    if (complete) {
      if (!message) {
        setMessage('Result is empty');
        partialMessage = "";
      }
    }
  }

  useEffect(() => {   
    getLlmInference().then(result => {
      console.log("getLlmInference result", result)
      setLlmInference(result);
    }).catch(error => {
      console.log(error)
    });
  }, []);

  useEffect(() => {   
    if (llmInference != null) {
      llmInference.generateResponse("What is the capital of California?", displayPartialResults);
    }
  } , [llmInference]);
 
  return (
    <div className="App">
      {message.length > 0 ? message : null}
    </div>
  );
}

export default App;



// maxTokens: 512,  // The maximum number of tokens (input tokens + output
        //                  // tokens) the model handles.
        // randomSeed: 1,   // The random seed used during text generation.
        // topK: 1,  // The number of tokens the model considers at each step of
        //           // generation. Limits predictions to the top k most-probable
        //           // tokens. Setting randomSeed is required for this to make
        //           // effects.
        // temperature:
        //     1.0,  // The amount of randomness introduced during generation.
        //           // Setting randomSeed is required for this to make effects.