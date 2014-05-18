#!/usr/local/bin/node
var http = require("http"),
    URL = require("url"),
    path = require("path"),
    fs = require("fs"),
    config = require("config"),
    util = require("util"),
    api = require("./api"),
    auth = require("http-auth"),
    port = process.argv[2] || (config.port !== undefined ? config.port : 8000);

var debug = process.argv[3] == "-d";


var server = function(request, response) {

  var url = URL.parse(request.url,true),
      filename = path.join(process.cwd(), url.pathname);

  debug && console.log("request uri: " + url.pathname);
  debug && console.log("request qs: " + url.search);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };

  if (url.pathname == "/api/files")
  {
    api.files(config,function(files){
      var headers = {};
      headers["Content-Type"] = "text/json";
      response.writeHead(200, headers);
      response.write(JSON.stringify(files), "binary");
      response.end();
    },debug);
  }
  else if (url.pathname == "/api/getTitle")
  {
    api.getTitle(config,url.query,function(title){
      var headers = {};
      headers["Content-Type"] = "text/json";
      response.writeHead(200, headers);
      response.write(JSON.stringify(title), "binary");
      response.end();
    },debug);
  }
  else if (url.pathname == "/api/move")
  {
    api.move(config,url.query,function(success){
      var headers = {};
      headers["Content-Type"] = "text/plain";
      response.writeHead(200, headers);
      if(success)
        response.write("success", "binary");
      else
        response.write("failure", "binary");
      response.end();
    },debug);
  }
  else if (url.pathname == "/api/erase")
  {
    api.erase(config,url.query,function(success){
      var headers = {};
      headers["Content-Type"] = "text/plain";
      response.writeHead(200, headers);
      if(success)
        response.write("success", "binary");
      else
        response.write("failure", "binary");
      response.end();
    },debug);
  }
  else if (url.pathname == "/api/dups")
  {
    api.dups(config,function(files){
      var headers = {};
      headers["Content-Type"] = "text/json";
      response.writeHead(200, headers);
      response.write(JSON.stringify(files), "binary");
      response.end();
    },debug);
  }
  else
  { 
    // TODO no dot files, only /, index.html, app, js, css, img, node_modules
    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) filename += '/index.html';

      fs.readFile(filename, "binary", function(err, file) {
        if(err) {        
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }

        var headers = {};
        var contentType = contentTypesByExtension[path.extname(filename)];
        if (contentType) headers["Content-Type"] = contentType;
        response.writeHead(200, headers);
        response.write(file, "binary");
        response.end();
      });
    });
  }
}

if(fs.exists(__dirname + "/.htpasswd"))
{
  var basic = auth.basic({
      file: __dirname + "/.htpasswd"
  });

  http.createServer(basic,server).listen(parseInt(port, 10));
} else
  http.createServer(server).listen(parseInt(port, 10));
//console.log("argv " + util.inspect(process.argv,false,null));
//console.log("config " + JSON.stringify(config));
console.log("ReNamer running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
