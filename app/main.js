import {default as JSZip} from 'bower_components/jszip/dist/jszip.min';
import {default as cssLoader} from 'modules/defer-css';
cssLoader();

const fileInput = document.querySelector('input');
const button = document.querySelector('button');
var file = null;

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

  const fr = new FileReader();
  fr.addEventListener('load', ev => {
    const doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = ev.target.result;

    const convs = doc.documentElement.querySelectorAll('.contents .thread');

    // Empty container
    const container = doc.documentElement.querySelector('.contents');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const zipFile = new JSZip();
    [].forEach.call(convs, conv => {
      const filename =
        Array.from(conv.querySelectorAll('.user'))
        .map(x => x.textContent)
        .filter((value, index, array) => array.indexOf(value) === index)
        .join('_') + '.html';
      console.log('Processing', filename);

      const newDoc = doc.cloneNode(true);
      newDoc.documentElement.querySelector('.contents').appendChild(conv);
      zipFile.file(filename, newDoc.documentElement.innerHTML);
    });

    const zipBlob = zipFile.generate({type: 'blob'});
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
  });
  fr.readAsText(file, 'utf-8');
});
