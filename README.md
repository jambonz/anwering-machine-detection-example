# anwering-machine-detection-example

This application illustrates how to use [answering machine detection (amd)](https://www.jambonz.org/docs/supporting-articles/answering-machine-detection/) on outbound calls placed jambonz. To test this application configure and run it as shown below, then trigger an outbound call via REST api, e.g.

```bash
curl --location -g 'https://{jambonz_url}/api/v1/Accounts/{account_sid}/Calls' \
--header 'Authorization: Bearer {api_key}' \
--header 'Content-Type: application/json' \
--data '{
    "application_sid": "{application_sid}",
    "from": "16172223333",
    "to": {
        "type": "phone",
        "number": "16174445555"
    }
}'
``` 

Note that you need a running jambonz system along with your account_sid, api key, and the application_sid for this application, which you will have added as an Application in the jambonz portal

## Configuration

After running
```bash
npm ci
```

You can run this application simply as 
```bash
node app.js
```

but the following environment variables are available

|name|description|default|
|-------|--------|----|
|WS_PORT|http port to listen on for incoming websocket connections from jambonz|3000|
|LOGLEVEL|log level (info or debug)|info|
|AMD_NOSPEECH_TIMEOUT_MS|time in milliseconds to wait for speech before returning amd_no_speech_detected|5000|
|AMD_DECISION_TIMEOUT_MS|time in milliseconds to wait before returning amd_decision_timeout|15000|
|AMD_TONE_TIMEOUT_MS|time in milliseconds to wait to hear a tone|20000|
|AMD_GREETING_COMPLETION_TIMEOUT_MS|silence in milliseconds to wait for during greeting before returning amd_machine_stopped_speaking|2000|


## How this application works
This is a very simple application, designed to illustrate amd and to provide code that you can use in your own applications.  

An outbound call is placed to the number provided in the POST request, and when the far answers the application plays a long-ish greeting while at the same time trying to determine if it is speaking to a human or a bot.  Once it determines which it is speaking to, it then switches to a different message based on whether it detected a human or a machine.

The relevant code for those interested [can be found here](./lib/routes/amd-test.js).

