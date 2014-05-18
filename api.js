var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    exec = require("child_process").exec,
    path = require("path"),
    sprintf = require("sprintf-js").sprintf,
    X = require("xregexp").XRegExp,
    request = require("request");

// Added regex tokens
X.install('extensibility');

// Add \R for matching any line separator (CRLF, CR, LF, etc.)
// Since `scope` is not specified, it uses 'default' (i.e., outside of character classes only)
X.addToken(
  /\\R/,
  function () {
    return '(?:\\r\\n|[\\n-\\r\\x85\\u2028\\u2029])';
  }
);

// Add POSIX character classes like [[:alpha:]] (ASCII-only)
X.addToken(
  /\[:([a-z\d]+):]/i,
  (function () {
    var posix = {
      alnum : 'A-Za-z0-9',
      alpha : 'A-Za-z',
      ascii : '\\0-\\x7F',
      blank : ' \\t',
      cntrl : '\\0-\\x1F\\x7F',
      digit : '0-9',
      graph : '\\x21-\\x7E',
      lower : 'a-z',
      print : '\\x20-\\x7E',
      punct : '!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~',
      space : ' \\t\\r\\n\\v\\f',
      upper : 'A-Z',
      word  : 'A-Za-z0-9_',
      xdigit: 'A-Fa-f0-9'
      //,mon   : '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
    };
    return function (match) {
      if (!posix[match[1]]) {
        throw new SyntaxError(match[1] + ' is not a valid POSIX character class');
      }
      return posix[match[1]];
    };
  }()),
  {scope: 'class'}
);

function replace(debug,num,show,pat,replacement){
  var ret = X.replace(show,pat,replacement);
  debug && console.log(sprintf("%2d",num)+" show: '"+show+"'");
  return ret;
}

function files(config,CB,debug){
  var incoming = path.normalize(config.incoming);
  var dir = fs.readdirSync(incoming);
  var files = [];

  while (dir.length) {
    var file = dir.pop();
    var stat = fs.statSync(path.join(incoming,file));
    var fileObj = {"file":file,"date":stat.mtime};
    if(stat.isDirectory()){
      var indir = fs.readdirSync(path.join(incoming,file));
      while (indir.length)
        dir.push(path.join(file,indir.pop()));
      fileObj.type = "dir";
      files.push(fileObj);
      continue;
    }
    debug && console.log("00 file: '" + file + "'");
    var show = path.basename(file);
    var ext = path.extname(show);
    debug && console.log("00 ext : '" + ext + "'");
    switch(ext)
    {
      case '.3gp':
      case '.avi':
      case '.mkv':
      case '.mp4':
      case '.mpg':
      case '.divx':
        break;
      default:

        fileObj.type = "unknown";
        files.push(fileObj);
        continue;
    }
    var i=1;
      
    show = replace(debug,i++,show,X('^The\\.100\\.',''),'The :1:0:0: ');
    show = replace(debug,i++,show,X('\\.[0-9a-z]{3}$','i'),'');
    show = replace(debug,i++,show,X('\\.us\\.','i'),'.');
    show = replace(debug,i++,show,X('\\.','g'),' ');
    show = replace(debug,i++,show,X('_','g'),' ');
    show = replace(debug,i++,show,X('[0-9]{3,4}p','i'),'');
    show = replace(debug,i++,show,X('(.*\') Us$','i'),'$1');
  //show = replace(debug,i++,show,X('HDTV.*','i'),'');
  //show = replace(debug,i++,show,X('PROPER.*',''),'');
  //show = replace(debug,i++,show,X('FINAL.*',''),'');
  //show = replace(debug,i++,show,X('FIXED.*',''),'');
  //show = replace(debug,i++,show,X('WEB.*',''),'');
  //show = replace(debug,i++,show,X('WEBRIP.*',''),'');
    show = replace(debug,i++,show,X('( ){0,1}-( ){0,1}',''),' ');
    show = replace(debug,i++,show,X('s([0-9]{1,2})e([0-9]{1,2})','i'),'S$1E$2#');
    show = replace(debug,i++,show,X('([0-9]{1,2})x([0-9]{1,2})','i'),'S$1E$2#');
    show = replace(debug,i++,show,X(' ([0-9]{2})([0-9]{2})',''),' S$1E$2#');
    show = replace(debug,i++,show,X(' s([0-9]{1})e([0-9]{2})','i'),' S0$1E$2#');
    show = replace(debug,i++,show,X(' s[0-9]{2}e[0-9]{2} ?','i'),function($0){return ' -'+$0.toUpperCase()+"#";});
    show = replace(debug,i++,show,X('#.*',''),'');
    show = replace(debug,i++,show,X('S H I E L D ',''),'S.H.I.E.L.D ');
    show = replace(debug,i++,show,X("Marvel's",''),"Marvels");
    show = replace(debug,i++,show,X('tosh\.0\.s?([0-9]{2})e?([0-9]{2}).*','i'),'Tosh.0 - S$1E$2');
    show = replace(debug,i++,show,X('The :1:0:0:',''),'The 100');
    show = replace(debug,i++,show,X("([0-9a-z])([0-9a-z']*) ",'gi'),function($0,$1,$2){return $1.toUpperCase()+($2===undefined?'':$2)+' ';});
    show = replace(debug,i++,show,X(" (is|a|the|of|an|as|in) ",'gi'),function($1){return $1.toLowerCase();});
    show = replace(debug,i++,show,X(' ([0-9])([0-9]{2})$',''),' - S0$1E$02');
    
    var season = replace(debug,99,show,X("^.* - S([0-9]{2})E[0-9]{2}$",''),'$1');
    var episode = replace(debug,99,show,X("^.* - S[0-9]{2}E([0-9]{2})$",''),'$1');
    show = replace(debug,99,show,X("^(.*) - S[0-9]{2}E[0-9]{2}$",''),'$1');

    fileObj.type="video";
    fileObj.show=show;
    fileObj.season=season;
    fileObj.episode=episode;
    fileObj.extension=ext;
    files.push(fileObj);

  }
  CB( files );
}

function getTitle(config,query,CB,debug){
  if ( query!==undefined
    && query.show!==undefined
    && query.show!==undefined
    && query.show!==undefined ) {
    
    debug&&console.log("getTitle show    " +query.show);
    debug&&console.log("getTitle season  " +query.season);
    debug&&console.log("getTitle episode " +query.episode);

    var i=1;
    var show = query.show;

    show=replace(debug,i++,show,X(' ','g'),'');
    show=replace(debug,i++,show,X('_','g'),'');
    show=replace(debug,i++,show,X('^2',''),'two');
    show=replace(debug,i++,show,X("'",'g'),'');
    show=replace(debug,i++,show,X("^The",''),'');
    show=replace(debug,i++,show,X("Marvels",''),'');
    show=replace(debug,i++,show,X("S\\.H\\.I\\.E\\.L\\.D",''),'SHIELD');
    show=replace(debug,i++,show,X("Newsroom",''),'$0_2012');
    show=replace(debug,i++,show,X("TomorrowPeople",''),'$0_2013');
    show=replace(debug,i++,show,X("Intelligence",''),'$0_2014');
    
    var url = config.epguides + "/" + show + "/";
    var ep = sprintf("%d-%02d",parseInt(query.season),parseInt(query.episode));
 
    debug&&console.log("url : " + url);
 
    request(url,function(err, response, body){
      var env = require('jsdom').env;
      env(body, function(errors, window) {
        var $ = require("jquery")(window);

        var eplist = $('div#eplist').text();
        debug&&console.log(eplist);
        var pat = ep+'(.*)\\R';
        debug&&console.log(pat);

        var match = X.exec(eplist,X(pat,''));
        if(match){
          match = match[1];
          debug&&console.log(match);

          pat = '.*[0-9]{2}\/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dev)\/[0-9]{2} *';
          //pat = '.*[0-9]{2}\/[[:mon:]]\/[0-9]{2} *';
          match=replace(debug,i++,match,X(pat,''),'');

          pat = ' *\\[[^\\]]*\\]';
          match=replace(debug,i++,match,X(pat,'g'),'');

          CB({"title":match.trim()});
        }
        else
        {
          CB({"error":true});
        }
      });
    });
  } else {
    CB({"error":true});
  }
}

function move(config,query,CB,debug){CB(true);}
function erase(config,query,CB,debug){CB(true);}
function dups(config,CB,debug){CB( [[{"file":"file 1.mkv","size":"1234"},
                                           {"file":"file 1.mpg","size":"1234"}],
                                          [{"file":"file 2.avi","size":"1234"},
                                           {"file":"file 3.mp4","size":"1234"}]]);}

module.exports = {
  files: files,
  getTitle: getTitle,
  move: move,
  erase: erase,
  dups: dups};

