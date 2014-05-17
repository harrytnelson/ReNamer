#!/usr/local/bin/node
var X = require("xregexp").XRegExp,
    config = require("config"),
    util = require("util"),
    api = require("./api");

console.log("Testing api.js");
console.log("  -  files");
api.files(config,function(files){
  console.log("files " + util.inspect(files,false,null));

  console.log("  -  getTitle");

  api.getTitle(config,"?show=revolution&season=1&episode=1",function(title){
    console.log("title " + title.title);
  });
},true);

