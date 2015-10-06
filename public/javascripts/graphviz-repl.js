var compiling = false;
var needCompile = true;
var type = 'dot';
var settings = {
  exportSuffix: '/export/txt',
  importSuffix: '/import',
  hostRoot: 'https://pad.systemli.org/p/'
};

function goToRoom(_this) {
  var roomName = $(_this).find('input').val();
  window.location = "/" + roomName;
  return false;
}

function goToRandom() {
  window.location = "/" + randomPadName();
}

function randomPadName()
{
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var string_length = 10;
  var randomstring = '';
  for (var i = 0; i < string_length; i++)
  {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

function txtImportPath(padName) {
  return settings.hostRoot + padName + settings.importSuffix;
}

function txtExportPath(padName) {
  return settings.hostRoot + padName + settings.exportSuffix;
}

function txtImportToPad(padName, data) {
  var url = txtImportPath(padName);
  $.ajax(
    {
      url: url,
      type: "post",
      processData: false,
      async: false,
      contentType: 'multipart/form-data; boundary=boundary',
      accepts: {
        text: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      data: 'Content-Type: multipart/form-data; boundary=--boundary\r\n\r\n--boundary\r\nContent-Disposition: form-data; name="file"; filename="import.txt"\r\nContent-Type: text/plain\r\n\r\n' + data + '\r\n\r\n--boundary'
    }
  );
}

function txtImportFromUrl (padName, source_url) {
  $.get(source_url).success(function(data){
    txtImportToPad(padName, data);
  });
}

function error(text){
  var errArea = $('#msg');
  if(text){
    errArea.text(text);
    errArea.fadeIn();
  }else{
    errArea.fadeOut();
  }
}

function setType(selected){
  type = $(selected).attr('type');
  var items = $(selected).parent().parent().children();
  items.each(function(e){
    $($($(items[e]).children()[0]).children()[0]).text('　');
  });
  $($(selected).children()[0]).text('✓');
  needCompile = true;
}

function getType(){
  return type;
}

function compile(dotData, cb){
  if(compiling){
    return;
  }
  compiling = true;
  $.ajax({
    type: 'POST',
    url: '/compile.b64',
    data: {dot: dotData,
           type: getType()},
        success: function(data, textStatus, jqXHR){
          compiling = false;
          $('#graph').attr('src',data);
          error();
          if(cb){
            cb();
          }
        },
        error: function(jqXHR, textStatus, errorThrown){
          compiling = false;
          if(jqXHR.status == 400){
            error(jqXHR.responseText);
            $('#graph').attr('src','/no_such_path');
          }
          if(cb){
            cb();
          }
        }
  });
}

var _cachedDotData = '';
function autoCompileDo(){
  var etherpadId = $('iframe').data('etherpad-id');
  $.get(txtExportPath(etherpadId), function( data ) {
    var _newDotData = data;
    var _cachedDotData = loadCachedDotData(etherpadId);
    if(_cachedDotData === null){
      // if cache is empty, use server data
      needCompile = true;
      cacheDotData(etherpadId, _newDotData);
    }
    else if(_cachedDotData !== _newDotData){
      // if this server data hasn't been rendered yet
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
    return _cachedData;
  else
    return null;
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
});
