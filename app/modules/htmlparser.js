self['module'] = {exports: {}};
importScripts('../nobabel/htmlparser/htmlparser.js');
export function HTMLParser(rawHtml) {
  return new Promise((resolve, reject) => {
    const parser =
      new self['module'].exports.Parser(
        new self['module'].exports.HtmlBuilder((err, dom) => {
          if(err) {
            reject(err);
          } else {
            resolve(dom);
          }
        }));
    parser.parseComplete(rawHtml);
  });
}
