import {FilesetResolver, LlmInference} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai';
const modelFileName = '/gemma-2b-it-gpu-int4.bin'; /* Update the file name */

async function getLlmInference() {
  console.log('Starting LLM Inference...');

  const genaiFileset = await FilesetResolver.forGenAiTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
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



