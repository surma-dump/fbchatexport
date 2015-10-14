importScripts('../nobabel/requirejs/require.js');
requirejs({
  baseUrl: '../',
  waitSeconds: 0
}, ['modules/webworker']);
