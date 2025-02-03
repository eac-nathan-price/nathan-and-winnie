/// <reference lib="webworker" />

let workerId: number;

addEventListener('message', ({ data: message }) => {
  switch (message.type) {
    case 'initRequest':
      workerId = message.data;
      postMessage({
        type: 'initResponse',
        from: workerId,
        done: true
      });
      break;
    
    default:
      postMessage({
        type: 'defaultResponse',
        from: workerId,
        data: message,
        done: true
      });
  }
});
