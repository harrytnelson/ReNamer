#!/usr/local/bin/node
var http = require("http"),
    URL = require("url"),
    path = require("path"),
    fs = require("fs"),
    config = require("config"),
    util = require("util"),
    api = require("./api"),
    port = process.argv[2] || (config.port !== undefined ? config.port : 8000);

http.createServer(function(request, response) {

  var url = URL.parse(request.url,true)
    , uri = url.pathname
    , filename = path.join(process.cwd(), uri);

//console.log("request uri: " + uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript"
  };

  if (uri == "/files")
{
  var files = api.files(config);
//console.log("files " + util.inspect(files,false,null));
  
      var headers = {};
      headers["Content-Type"] = "text/json";
      response.writeHead(200, headers);
      response.write(JSON.stringify(files), "binary");
      response.end();
}
else
  if (uri == "/getTitle")
{
  var files = api.getTitle(config,url.queryString);
      var headers = {};
      headers["Content-Type"] = "text/json";
      response.writeHead(200, headers);
      response.write(JSON.stringify(files), "binary");
      response.end();
}
else
  if (uri == "/move")
{
  var files = api.move(config,url.queryString);
      var headers = {};
      headers["Content-Type"] = "text/plain";
      response.writeHead(200, headers);
if(files)
      response.write("success", "binary");
else
      response.write("failure", "binary");
      response.end();
}
else
{ path.exists(filename, function(exists) {
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
}).listen(parseInt(port, 10));

console.log("argv " + util.inspect(process.argv,false,null));
console.log("config " + JSON.stringify(config));
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
