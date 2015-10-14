import {HTMLParser} from 'modules/htmlparser';

postMessage('Starting webworker');
self.addEventListener('message', ev => {
  console.log('Received a message');
  HTMLParser(ev.data).then(dom => {
    postMessage(dom);
  });
})
