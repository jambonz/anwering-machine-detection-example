const initialGreeting = `Hi there.  This is a test of the Answering Machine Detection system.  
I don\'t yet know if you are a human or a machine, but I\'m going to try to figure it out.
For now, I am going to continue with the assumption that you are a human, 
but as more information comes in I may change my mind.  You will hear me interrupt myself if I do get more information.
Actually, by now I probably should have made a decision, so this is kind of curious. Hmm.`;
const humanGreeting = `Hi there!  I have determined that you are a human.  That's all for now`;
const whenIKnowYouAreMachine = `hi machine`;  
const whenIHearTone = `Beep right back at you!`;
const machineGreeting = `Hi friend!  I have determined that you are a machine and I have left you this test message.
That's all for now`; 
const noDetermination = `I'm sorry, I was not able to determine if you are a human or a machine.  That's all for now.`;

const service = ({logger, makeService}) => {
  const svc = makeService({path: '/amd-test'});

  svc.on('session:new', (session) => {
    session.locals = {logger: logger.child({call_sid: session.call_sid})};
    logger.info({session}, `new call session: ${session.call_sid}`);

    session
      .on('/amd-event', onAmdEvent.bind(null, session))
      .on('close', onClose.bind(null, session))
      .on('error', onError.bind(null, session));

    session
      .config({
        amd: {
          actionHook: '/amd-event',
          thresholdWordCount: process.env.AMD_THRESHOLD_WORD_COUNT || 10,
          recognizer: {
            vendor: process.env.STT_VENDOR || 'deepgram',
            language: process.env.LANGUAGE || 'en-US',
          },
          timers: {
            noSpeechTimeoutMs: process.env.AMD_NOSPEECH_TIMEOUT_MS || 5000,
            decisionTimeoutMs: process.env.AMD_DECISION_TIMEOUT_MS || 15000,
            toneTimeoutMs: process.env.AMD_TONE_TIMEOUT_MS || 20000,
            greetingCompletionTimeoutMs: process.env.AMD_GREETING_COMPLETION_TIMEOUT_MS || 2000,
          }
        }
      })
      .pause({length: 750})
      .say({text: initialGreeting})
      .send();
  });
};

const onClose = (session, code, reason) => {
  const {logger} = session.locals;
  logger.info({session, code, reason}, `session ${session.call_sid} closed`);
};

const onError = (session, err) => {
  const {logger} = session.locals;
  logger.info({err}, `session ${session.call_sid} received error`);
};

const onAmdEvent = (session, evt) => {
  const {logger} = session.locals;
  logger.info({evt}, `session ${session.call_sid} received AMD event`);

  switch (evt.type) {
    case 'amd_human_detected':
      session
        .say({text: humanGreeting})
        .hangup();
        reply();
      break;
      
    case 'amd_machine_detected':
      session
        .say({text: whenIKnowYouAreMachine})
        .pause({length: 20})
        .reply();
      break;
      
    case 'amd_no_speech_detected':
      session
        .say({text: 'hey there, I haven\'t heard anything from you in a while.  I\'m going to hang up now.'})
        .hangup()
        reply();
      break;
      
    case 'amd_decision_timeout':
      session
        .say({text: noDetermination})
        .hangup()
        reply();
      break;
      
    case 'amd_machine_stopped_speaking':
      session
        .say({text: machineGreeting})
        .hangup()
        reply();
      break;
      
    case 'amd_tone_detected':
      session
        .say({text: whenIHearTone})
        .pause({length: 20})
        .reply()
      break;
      
    case 'amd_error':
      session
        .say({text: 'Oh this is unfortunate.  I seem to have malfunctioned. I\'m going to hang up now.'})
        .hangup()
        reply();
      break;
      
    case 'amd_stopped':
    default:
      session.reply();
      break;
  }
}

module.exports = service;
