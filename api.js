var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    exec = require("child_process").exec,
    path = require("path"),
    sprintf = require("sprintf-js").sprintf,
    X = require("xregexp").XRegExp;


var files = function(config,debug){
  function replace(num,show,pat,replacement){
    var ret = X.replace(show,pat,replacement);
    debug && console.log(sprintf("%2d",num)+" show: '"+show+"'");
    return ret;
  }

  var incoming = path.normalize(config.incoming);
  var dir = fs.readdirSync(incoming);
  var files = [];


  while (dir.length) {
    var file = dir.pop();
    if(fs.statSync(path.join(incoming,file)).isDirectory()){
      var indir = fs.readdirSync(path.join(incoming,file));
      while (indir.length)
        dir.push(path.join(file,indir.pop()));
      files.push({"name":file,"type":"dir"});
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
        files.push({"name":file,"type":"unknown"});
        continue;
    }
    var i=1;
      
    show = replace(i++,show,X('^The\\.100\\.',''),'The :1:0:0: ');
    show = replace(i++,show,X('\\.[0-9a-z]{3}$','i'),'');
    show = replace(i++,show,X('\\.us\\.','i'),'.');
    show = replace(i++,show,X('\\.','g'),' ');
    show = replace(i++,show,X('_','g'),' ');
    show = replace(i++,show,X('[0-9]{3,4}p','i'),'');
    show = replace(i++,show,X('(.*\') Us$','i'),'$1');
    //show = replace(i++,show,X('HDTV.*','i'),'');
    //show = replace(i++,show,X('PROPER.*',''),'');
    //show = replace(i++,show,X('FINAL.*',''),'');
    //show = replace(i++,show,X('FIXED.*',''),'');
    //show = replace(i++,show,X('WEB.*',''),'');
    //show = replace(i++,show,X('WEBRIP.*',''),'');
    show = replace(i++,show,X('( ){0,1}-( ){0,1}',''),' ');
    show = replace(i++,show,X('s([0-9]{1,2})e([0-9]{1,2})','i'),'S$1E$2#');
    show = replace(i++,show,X('([0-9]{1,2})x([0-9]{1,2})','i'),'S$1E$2#');
    show = replace(i++,show,X(' ([0-9]{2})([0-9]{2})',''),' S$1E$2#');
    show = replace(i++,show,X(' s([0-9]{1})e([0-9]{2})','i'),' S0$1E$2#');
    show = replace(i++,show,X(' s[0-9]{2}e[0-9]{2} ?','i'),function($0){return ' -'+$0.toUpperCase()+"#";});
    show = replace(i++,show,X('#.*',''),'');
    show = replace(i++,show,X('S H I E L D ',''),'S.H.I.E.L.D ');
    show = replace(i++,show,X("Marvel's",''),"Marvels");
    show = replace(i++,show,X('tosh\.0\.s?([0-9]{2})e?([0-9]{2}).*','i'),'Tosh.0 - S$1E$2');
    show = replace(i++,show,X('The :1:0:0:',''),'The 100');
    show = replace(i++,show,X("([0-9a-z])([0-9a-z']*) ",'gi'),function($0,$1,$2){return $1.toUpperCase()+($2===undefined?'':$2)+' ';});
    show = replace(i++,show,X(" (is|a|the|of|an|as|in) ",'gi'),function($1){return $1.toLowerCase();});
    show = replace(i++,show,X(' ([0-9])([0-9]{2})$',''),' - S0$1E$02');
    
    var season = replace(99,show,X("^.* - S([0-9]{2})E[0-9]{2}$",''),'$1');
    var episode = replace(99,show,X("^.* - S[0-9]{2}E([0-9]{2})$",''),'$1');
    show = replace(99,show,X("^(.*) - S[0-9]{2}E[0-9]{2}$",''),'$1');

    files.push({"name":file,
                "type":"video",
                "show":show,
                "season":season,
                "episode":episode,
                "extension":ext});

  }
  return files;
}

var getTitle = function(config,show,season,episode){

return {"title":"Episode Title"};

}

var move = function(config,from,to){return true;}
var erase = function(config,file){return true;}
var dups = function(config){return [[{"file":"file 1.mkv","size":"1234"},
                                     {"file":"file 1.mpg","size":"1234"}],
                                    [{"file":"file 2.avi","size":"1234"},
                                     {"file":"file 3.mp4","size":"1234"}]];}

module.exports = {
  files: files,
  getTitle: getTitle,
  move: move};

