import {default as cssLoader} from 'modules/defer-css';
cssLoader();

const ww = new Worker('nobabel/webworker.js');
const fileInput = document.querySelector('input');
const button = document.querySelector('button');
var file = null;

ww.addEventListener('message', ev => {
  switch (ev.data.type) {
    case 'progress':
      setProgress(ev.data.message, ev.data.progress * 100);
    break;
    case 'result':
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = ev.data.message;
      a.download = 'messages.zip';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(() => {
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
        button.disabled = false;
        setProgress('Download Archive', 0);
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
  button.disabled = true;
  setProgress('Reading file', 0);
  loadFile(file).then(content => {
    ww.postMessage(content);
  });
});

function loadFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = ev => {
      return resolve(ev.target.result);
    };
    fr.readAsText(file, 'utf-8');
  });
}

function setProgress(text, percent) {
  button.textContent = text;
  button.style.background =
    `linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.54) ${percent}%,
      rgba(0, 0, 0, 0) ${percent}%)`;
}
