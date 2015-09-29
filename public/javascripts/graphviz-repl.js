var compiling = false;
var needCompile = true;
var type = 'dot';
var settings = {
  exportSuffix: '/export/txt',
  hostRoot: 'http://piratepad.be/p/'
};

function txtExportPath(padName) {
  return settings.hostRoot + padName + settings.exportSuffix;
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

var _cachedDotData = '';
function autoCompileDo(){
  var etherpadId = $('iframe').data('etherpad-id');
  $.get(txtExportPath(etherpadId), function( data ) {
    var _cachedDotData = loadCachedDotData();
    var _newDotData = data;
    if(_cachedDotData != _newDotData){
      needCompile = true;
      cacheDotData(etherpadId, _newDotData);
    }

    if(!needCompile){
      return;
    }
    compile(_newDotData,
            function(){
              needCompile = false;
            });
  });
}

function loadCachedDotData(etherpadId) {
  var _cachedData = localStorage.getItem(etherpadId);
  if (_cachedData !== null && _cachedData.trim() !== "")
    return _data;
  else
    return defaultData();
}

function cacheDotData(etherpadId, data) {
  localStorage.setItem(etherpadId, data);
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
  autoCompileDo();
  setInterval(autoCompileDo, 500);
})

