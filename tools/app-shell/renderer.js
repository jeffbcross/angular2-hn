/**
 * This is the process that actually loads and renders the app module.
 * It needs to load node-specific polyfills.
 */
require('reflect-metadata');
/**
 * Set of core-js polyfills borrowed from Angular CLI
 */
require('reflect-metadata');
/** IE9, IE10 and IE11 requires all of the following polyfills. **/
require('core-js/es6/symbol');
require('core-js/es6/object');
require('core-js/es6/function');
require('core-js/es6/parse-int');
require('core-js/es6/parse-float');
require('core-js/es6/number');
require('core-js/es6/math');
require('core-js/es6/string');
require('core-js/es6/date');
require('core-js/es6/array');
require('core-js/es6/regexp');
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/reflect');
require('core-js/es7/reflect');
require('core-js/es7/array');

require('zone.js/dist/zone-node');
require('zone.js/dist/long-stack-trace-zone');

const preboot = require('preboot');
const mdkirp = require('mkdirp');
const path = require('path');

const { enableProdMode } = require('@angular/core');
const { renderModule } = require('@angular/platform-server');
const { readFileSync, writeFileSync } = require('fs');

enableProdMode();

console.log('about to get appModule');
// Script is invoked as: node main.bundle.js index.html root-shell.html /shell
const [bundleName, moduleName, templatePath, outputPath, route, appRoot] = process.argv.slice(2);
console.log('...', bundleName, moduleName, templatePath, outputPath, route, appRoot);
const appModule = require(bundleName)['AppShell'][moduleName];

console.log('output directory', path.resolve(outputPath, '../'))

renderModule(appModule, {
  document: readFileSync(templatePath, 'utf-8'),
  url: route
})
  .then(body => {
    console.log('body', body);
    return body;
    // return body.replace('<!-- INSERT_PREBOOT_SCRIPT -->', ['<script>', preboot.getInlineCode({
    //   appRoot: [appRoot],
    //   uglify: true
    // }), '</script>'].join('\n'));
  })
  .then((body) => {
    mdkirp.sync(path.resolve(outputPath, '../'));
    return body;
  })
  .then((body) => writeFileSync(outputPath, body));
