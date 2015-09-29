var GraphvizREPL = require('../lib/graphviz_repl')
var dotPath = null

function b64encode(data){
  return (new Buffer(data, 'binary')).toString('base64')
}

exports.setDotPath = function(path){
  dotPath = path
}

exports.index = function(req, res){
  res.render('index', { title: 'Graphviz REPL' })
}

exports.etherpadPage = function(req, res){
  res.render('etherpad', { title: 'Graphviz REPL', etherpadId: req.params.id })
}

exports.compile_to_base64 = function(req, res){
  if(!req.body.dot){
    res.status(400)
    res.write("dot parameter required.\n")
    res.end()
    return
  }

  function compiled(err, stdout, stderr){
    if(err || stderr){
      res.status(400)
      res.write("graphviz error: " + err + "\n" + stderr + "\n")
      res.end()
      return
    }

    res.status(200)
    res.set('Content-Type', 'text/plain')
    res.end('data:image/png;base64,' + b64encode(stdout), 'utf-8')
  }

  var g = new GraphvizREPL(dotPath)
  g.on('compiled', compiled)
  g.compile(
    req.body.dot,
    req.body.type,
    //compiled
    function(){}
    )
}
