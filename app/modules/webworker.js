import {HTMLParser} from 'modules/htmlparser';
import {default as JSZip} from 'bower_components/jszip/dist/jszip.min';


self.addEventListener('message', ev => {
  self.postMessage({
    type: 'progress',
    progress: 0,
    message: 'Reading file'
  });
  loadFile(ev.data)
  .then(content => {
    self.postMessage({
      type: 'progress',
      progress: 0,
      message: 'Parsing file'
    });
    return HTMLParser(content);
  })
  .then(dom => {
    self.postMessage({
      type: 'progress',
      progress: 0,
      message: 'Splitting conversations'
    });

    dom = dom[0];
    const contents = findFirstByClass.call(dom, 'contents');
    const contentsCopy = Object.assign({}, contents);
    contents.children = [];
    const threads = findAllByClass.call(contentsCopy, 'thread');

    return threads.map(thread => {
      contents.children = [thread];
      return Object.assign({}, dom);
    });
  }).then(threads => {
    const zipFile = new JSZip();
    let i = 0;
    threads.map((conv, index, array) => {
      self.postMessage({
        type: 'progress',
        progress: index / array.length,
        message: `Serializing conversation ${index + 1} of ${array.length}`
      });
      return domToString(conv);
    }).forEach((conv, index, array) => {
      zipFile.file(`conversation_${i++}.html`, conv);
    });
    return zipFile;
  }).then(zipFile => {
    self.postMessage({
      type: 'result',
      message: zipFile.generate({type: 'blob'})
    });
  });
});

function loadFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.addEventListener('load', ev => {
      return resolve(ev.target.result);
    });
    fr.readAsText(file, 'utf-8');
  });
}

function hasClass(classname) {
  return this.hasOwnProperty('attributes') &&
    this.attributes.class === classname;
}

function findFirstByClass(classname) {
  if (hasClass.call(this, classname)) {
    return this;
  }
  const match = (this.children || [])
  .map(child => findFirstByClass.call(child, classname))
  .filter(x => !!x);
  if (match.length == 0) {
    return false;
  }
  return match[0];
}

function findAllByClass(classname) {
  let r = [];
  if (hasClass.call(this, classname)) {
    r = [this];
  }
  return [
    ...r,
    ...(this.children || [])
    .map(c => findAllByClass.call(c, classname))
    .reduce((array, elem) => [...array, ...elem], [])
  ];
}

function domToString(dom) {
  if(dom.type === 'text') {
    return dom.data;
  }
  if(!dom.children && dom.raw.endsWith('/')) {
    return `<${dom.raw}>`;
  }
  return [
    `<${dom.raw}>`,
    ...(dom.children || []).map(domToString),
    `</${dom.name}>`
  ].join('');
}
