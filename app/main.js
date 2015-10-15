import {default as cssLoader} from 'modules/defer-css';
cssLoader();

const ww = new Worker('nobabel/webworker.js');
const fileInput = document.querySelector('input');
const button = document.querySelector('button');
var file = null;

ww.addEventListener('message', ev => {
  switch (ev.data.type) {
    case 'progress':
      button.textContent = ev.data.message;
    break;
    case 'result':
      const zipBlob = ev.data.message;
      const blobURL = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobURL;
      a.download = 'messages.zip';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
        document.body.removeChild(a);
      }, 2000);
    break;
  };
});

fileInput.addEventListener('change', ev => {
  if (ev.target.files.length <= 0) {
    return;
  }
  file = ev.target.files[0];
});

button.addEventListener('click', () => {
  if (!file) {
    return;
  }

  ww.postMessage(file);
});
