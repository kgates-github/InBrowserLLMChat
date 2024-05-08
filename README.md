# Agentic I
Using a compact version of Google's Gemini (Gemma2b) running in-browser, this prototype explores intricacies of using hand gestures and voice commands to interact with a low-latency LLM.

NOTE: This app requires a current version of Google Chrome browser to run.

To run:
* Download a copy of [gemma-2b-it-gpu-int4.bin](https://www.kaggle.com/models/google/gemma/tfLite/gemma-2b-it-gpu-int4)
* Put gemma-2b-it-gpu-int4.bin in the public directory:
```
/app/public/gemma-2b-it-gpu-int4.bin
```
* Create venv:
```
python3 -m venv venv
source venv/bin/activate
```
* Install:
```
cd app/
npm install
```
* Run:
```
npm start
```
