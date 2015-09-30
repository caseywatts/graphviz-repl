var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , optimist = require('optimist')
  , argv = optimist
           .usage('Usage: $0 [-d PATH] [-a LISTEN_ADDR] [-p PORT]')
           .alias(
             {'d': 'dot'
             ,'a': 'addr'
             ,'p': 'port'
             })
           .describe(
             {'d': 'dot command path'
             ,'a': 'listen address'
             ,'p': 'listen port'
             })
           .default(
             {'a': '127.0.0.1'
             ,'p': "3000"})
           .argv;

if(argv.h || argv.help){
  optimist.showHelp()
  process.exit(-1)
}
var app = express();

app.configure(function(){
  app.set('port', parseInt(argv.port))
  app.set('addr', argv.addr || 'localhost')
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
});

app.configure('development', function(){
  app.use(express.errorHandler())
});

function findDotPath(){
  var cands = ['/bin/dot', '/usr/bin/dot', '/usr/local/bin/dot', '/app/graphviz/bin']
  if(argv.dot){
    cands.unshift(argv.dot)
  }
  for(var i in cands){
    if(fs.existsSync(cands[i])){
      console.warn('using ' + cands[i])
      return cands[i]
    }
  }
  console.error('dot executable not found.')
  console.error('please install graphviz or specify the dot path by -d option')
  process.exit(-1)
}

routes.setDotPath(findDotPath());
app.get('/', routes.index);
app.post('/compile.b64', routes.compile_to_base64);
app.get('/etherpad/:id', routes.etherpadPage);

http.createServer(app).listen(
  app.get('port'),
  argv.addr,
  function(){
    console.log(['server listening on', app.get('addr'), app.get('port')].join(' '));
  });
