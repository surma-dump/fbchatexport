import {HTMLParser} from 'modules/htmlparser';
import {default as JSZip} from 'bower_components/jszip/dist/jszip.min';

self.addEventListener('message', ev => {
  self.postMessage({
    type: 'progress',
    progress: -1,
    message: `Parsing file`
  });
  return HTMLParser(ev.data)
  .then(dom => {
    self.postMessage({
      type: 'progress',
      progress: -1,
      message: 'Splitting conversations'
    });

    dom = dom[0];
    const contents = findFirstByClass.call(dom, 'contents');
    const contentsCopy = Object.assign({}, contents);
    contents.children = [];
    const threads = findAllByClass.call(contentsCopy, 'thread');

    return threads.map((thread, index, array) => {
      self.postMessage({
        type: 'progress',
        progress: index / array.length,
        message: `Processing conversation ${index + 1} of ${array.length}`
      });
      contents.children = [thread];
      let name = thread.children[0].data.replace(/[^a-z0-9]/ig, '_');
      if(name.length > 200) {
        name = name.substr(0, 20);
      }
      return {
        name:  `${name}-${index}.htm`,
        content: domToString(dom)
      };
    });
  }).then(threads => {
    const zipFile = new JSZip();
    let i = 0;
    threads.forEach(thread => {
      zipFile.file(thread.name, thread.content);
    });
    return zipFile;
  }).then(zipFile => {
    self.postMessage({
      type: 'progress',
      progress: -1,
      message: 'Generating ZIP file'
    });
    const zipBlob = zipFile.generate({type: 'blob'});
    const blobURL = URL.createObjectURL(zipBlob);
    self.postMessage({
      type: 'result',
      message: blobURL
    });
  });
});

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
