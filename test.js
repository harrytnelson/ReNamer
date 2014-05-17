#!/usr/local/bin/node
var X = require("xregexp").XRegExp,
    config = require("config"),
    util = require("util"),
    api = require("./api");

console.log("Testing api.js");
var files = api.files(config,true);
console.log("files " + util.inspect(files,false,null));

var A=['a','b','c'];
var i=0;
while( A.length )
{
  var a = A.pop();
  console.log(i++ + " " + a);
  if('a'==a) A.push('d');
}
