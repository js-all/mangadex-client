const browserify = require("browserify");
const watchify = require("watchify");
const fs = require('fs');

const b = browserify("./frontend/ts/main.js", {
    debug: true,
    ignoreMissing: true,
    builtins: false,
    commondir: false,
    detectGlobals: false,
    cache: {},
    packageCache: {},
    plugin: [watchify],
});
b.exclude("fs");
b.exclude("electron");
b.exclude("electron-updater");
b.exclude("electron-settings");
b.exclude("path");
b.exclude("url");
b.exclude("sqlite3");
b.exclude("express");
b.exclude("net");
b.exclude("body-parser");

b.on('update', bundle);
bundle();
 
function bundle() {
  b.bundle()
    .on('error', console.error)
    .pipe(fs.createWriteStream('./frontend/ts/bundle.js'))
  ;
}
