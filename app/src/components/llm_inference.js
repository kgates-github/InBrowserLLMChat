//import {FilesetResolver, LlmInference} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';
import {FilesetResolver, LlmInference} from '@mediapipe/tasks-genai';
const modelFileName = '/gemma-2b-it-gpu-int4.bin'; 

async function getLlmInference() {
  console.log('Starting LLM Inference...');

  const genaiFileset = await FilesetResolver.forGenAiTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.13/wasm'
  );

  return new Promise((resolve, reject) => {
    LlmInference
      .createFromOptions(
        genaiFileset, {
          baseOptions: {modelAssetPath: process.env.PUBLIC_URL + modelFileName},
        }
      )
      .then(llm => {
        resolve(llm);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export default getLlmInference;