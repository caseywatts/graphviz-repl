var compiling = false
var needCompile = true
var type = 'dot'
function dotData(){
  return $('#dot').val()
}

function error(text){
  var errArea = $('#msg');
  if(text){
    errArea.text(text)
    errArea.fadeIn()
  }else{
    errArea.fadeOut()
  }
}

function setType(selected){
  type = $(selected).attr('type')
  var items = $(selected).parent().parent().children()
  items.each(function(e){
    $($($(items[e]).children()[0]).children()[0]).text('　')
  });
  $($(selected).children()[0]).text('✓')
  needCompile = true
}

function getType(){
  return type
}

function compile(dotData, cb){
  if(compiling){
    return;
  }
  compiling = true
  $.ajax({
    type: 'POST',
    url: '/compile.b64',
    data: {dot: dotData
          ,type: getType()},
        success: function(data, textStatus, jqXHR){
          compiling = false
          $('#graph').attr('src',data)
          error()
          if(cb){
            cb()
          }
        },
        error: function(jqXHR, textStatus, errorThrown){
          compiling = false
          if(jqXHR.status == 400){
            error(jqXHR.responseText)
            $('#graph').attr('src','/no_such_path')
          }
          if(cb){
            cb()
          }
        }
  })
}

var _dotData = ''
function autoCompileDo(){
  $.get('http://piratepad.be/p/yourpadname/export/txt', function( data ) {
    var _newDotData = data;
    if(_dotData != _newDotData){
      needCompile = true;
      _dotData = _newDotData;
      cacheDotData(_dotData);
    }

    if(!needCompile){
      return
    }
    debugger;
    compile(_dotData,
            function(){
              needCompile = false;
            })
  })
}

function loadDotData() {
  var _data = localStorage.getItem('dotData');
  if (_data != null && _data.trim() != "")
    return _data
  else
    return defaultData()
}

function cacheDotData(data) {
  localStorage.setItem('dotData', data)
}

function defaultData() {
  return ['digraph noname {',
    '   node[shape=box]',
    '   graph[nodesep=2, ranksep=2]',
    '   graphviz_repl [label="Graphviz-REPL"]',
    '   you[label="You", shape=circle]',
    '   graphviz_repl -> you[label="welcome"]',
    '   {rank=same; graphviz_repl; you}',
    '}'].join("\n");
}

$(document).ready(function(){
  $('#dot').focus()
  $('#dot').val(loadDotData())
  setInterval(autoCompileDo, 500)
})

