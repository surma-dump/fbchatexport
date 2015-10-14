import {default as HTMLParser} from 'modules/htmlparser';

console.log(HTMLParser);
const parser =
  new HTMLParser.Parser(new HTMLParser.HtmlBuilder((err, dom) => {
    if(err) {
      console.log('Error', err);
      return;
    }
    console.log(dom);
  }));
parser.parseComplete(`<!doctype html>
<html>
<body>
  <h1>Ohai</h1>
</body>
</html>
`);
postMessage('wat?');
self.addEventListener('message', ev => {
  console.log(ev);
});
