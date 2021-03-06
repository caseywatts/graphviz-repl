var compiling = false;

var roomNavigator = {
  goToRoom: function (_this) {
    var roomName = $(_this).find('input').val();
    window.location = "/" + roomName;
    return false;
  },
  goToRandom: function () {
    window.location = "/" + this.randomPadName();
  },
  randomPadName: function () {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var stringLength = 10;
    var randomString = '';
    for (var i = 0; i < stringLength; i++)
    {
      var rnum = Math.floor(Math.random() * chars.length);
      randomString += chars.substring(rnum, rnum + 1);
    }
    return randomString;
  }
};

var userInterfaceInteractor = {
  _type: 'dot', // this is a default value that may be overwritten
  getEtherpadId: function (){ return $('iframe').data('etherpad-id'); },
  get$errorArea: function (){
    return $('#msg');
  },
  hideError: function (text){
    this.get$errorArea().fadeOut();
  },
  displayError: function (text){
    this.get$errorArea().text(text);
    this.get$errorArea().fadeIn();
  },
  setType: function (selected){
    this._type = $(selected).attr('type');
    var items = $(selected).parent().parent().children();
    items.each(function(e){
      $($($(items[e]).children()[0]).children()[0]).text('　');
    });
    $($(selected).children()[0]).text('✓');
    this.callCompile();
  },
  getType: function (){
    return this._type;
  },
  hasGraphRenderedEvenOnce: function (){
    return $('img#graph').attr('src') !== undefined;
  },
  displayNoImage: function (){
    $('#graph').attr('src','/no_such_path');
  },
  greyOutImage: function (){
    $('#graph').css('opacity', '.2');
  },
  unGreyOutImage: function (){
    $('#graph').css('opacity', '1');
  },
  displayImage: function (data){
    $('#graph').attr('src', data);
  },
  displayForSuccess: function (imageSrc){
    this.displayImage(imageSrc);
    this.unGreyOutImage();
    this.hideError();
  },
  displayForError: function (errorText){
    this.greyOutImage();
    this.displayError(errorText);
  },
  callCompile: function (){
    graphRenderer.renderIfNeeded(this.getEtherpadId());
  }
};

var etherpadWhisperer = {
  settings: {
    exportSuffix: '/export/txt',
    importSuffix: '/import',
    hostRoot: 'http://etherpad.net/p/'
  },

  txtImportPath: function (padName) {
    return this.settings.hostRoot + padName + this.settings.importSuffix;
  },

  txtExportPath: function (padName) {
    return this.settings.hostRoot + padName + this.settings.exportSuffix;
  },

  txtImportToPad: function (padName, data) {
    var url = this.txtImportPath(padName);
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
  },

  txtImportFromUrl: function (padName, sourceUrl) {
    var _this = this;
    $.get(sourceUrl).success(function(data){
      _this.txtImportToPad(padName, data);
    });
  },

  tutorials: [
    {'name': 'Table of Contents'     , 'url': 'https://gist.githubusercontent.com/caseywatts/78e1577fab56d04df8cd/raw/ac81e58f707e7121d76c49b2782baad67645a4d2/0tableOfContents.dot'},
    {'name': '1 Simplest Diagrams'   , 'url': 'https://gist.githubusercontent.com/caseywatts/78e1577fab56d04df8cd/raw/ac81e58f707e7121d76c49b2782baad67645a4d2/1simplestDiagrams.dot'},
    {'name': '2 Advanced Attributes' , 'url': 'https://gist.githubusercontent.com/caseywatts/78e1577fab56d04df8cd/raw/ac81e58f707e7121d76c49b2782baad67645a4d2/2advancedAttributes.dot'},
    {'name': '3 With Subgraphs'      , 'url': 'https://gist.githubusercontent.com/caseywatts/78e1577fab56d04df8cd/raw/ac81e58f707e7121d76c49b2782baad67645a4d2/3withSubgraphs.dot'},
  ],

  importTutorial: function (number) {
    var etherpadId = $('iframe').data('etherpad-id');
    this.txtImportFromUrl(etherpadId, this.tutorials[number].url);
  }
};

var cacheWhisperer = {
  loadCachedDotData: function (etherpadId) {
    var _cachedData = localStorage.getItem(etherpadId);
    if (_cachedData !== null && _cachedData.trim() !== "")
      return _cachedData;
    else
      return null;
  },
  cacheDotData: function (etherpadId, data) {
    localStorage.setItem(etherpadId, data);
  }
};

var graphRenderer = {
  renderIfNeeded: function (etherpadId){
    var _this = this;
    $.get(etherpadWhisperer.txtExportPath(etherpadId), function( data ) {
      var _newDotData = data;
      var _cachedDotData = cacheWhisperer.loadCachedDotData(etherpadId);
      var _dataHasChanged = _cachedDotData !== _newDotData;
      var _thisIsTheFirstRender = !userInterfaceInteractor.hasGraphRenderedEvenOnce();
      if(_thisIsTheFirstRender){
        _this._cacheAndRender(etherpadId, _newDotData);
      }
      else if(_dataHasChanged){
        _this._cacheAndRender(etherpadId, _newDotData);
      }
      else {
        return;
      }
    });
  },
  _cacheAndRender: function (etherpadId, _newDotData){
    cacheWhisperer.cacheDotData(etherpadId, _newDotData);
    this._compileNewImage(_newDotData, userInterfaceInteractor.getType());
  },
  _compileNewImage: function (dotData, type){
    this._compileToSVG(dotData, type);
  },
  _compileFromServer: function (dotData, type){
    if(compiling){
      return;
    }
    compiling = true;
    $.ajax({
      type: 'POST',
      url: '/compile.b64',
      data: {
        dot: dotData,
        type: type
      }
    })
    .done(this._successCallback)
    .fail(this._errorCallback)
    .always(function (){
      compiling = false;
    });
  },
  _compileToSVG: function (dotData, type){
    if(compiling){
      return;
    }
    compiling = true;
    try {
      var svgData = Viz(dotData, {'format':"svg", 'engine': type});
      var pngData = svgToPngConverter.svgStringToPngData(svgData, function(pngData) {
        userInterfaceInteractor.displayForSuccess(pngData);
      });
    } catch (e) {
      userInterfaceInteractor.displayForError("Couldn't compile this graphviz");
    }
    compiling = false;
  }
};

var svgToPngConverter = {
  svgStringToPngData: function (svgString, callback) {
    var svgImage = new Image();
    svgImage.src = "data:image/svg+xml;utf8," + svgString;

    svgImage.onload = function() {
      var canvas = document.createElement("canvas");
      canvas.width = svgImage.width;
      canvas.height = svgImage.height;

      var context = canvas.getContext("2d");
      context.drawImage(svgImage, 0, 0);

      var pngImage = new Image();
      pngImage.src = canvas.toDataURL("image/png");

      callback(pngImage.src);
    };
  }
};

$(document).ready(function(){
  userInterfaceInteractor.callCompile();
  setInterval(function(){userInterfaceInteractor.callCompile();}, 500);
});
