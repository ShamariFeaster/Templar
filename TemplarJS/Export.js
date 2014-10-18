structureJS.module('Export', function(require){

var _ = this;
var DOM = require('DOM');
var Map = require('Map');
var State = require('State');
var Bootstrap = require('Bootstrap');
var Compile = require('Compile');
var Templar = require('Templar');

/******Initialization*******/

var existingOnloadFunction = window.onload || function(){};

window.onload = function(){
  var aplContentNode = document.getElementById('apl-content');
  
  existingOnloadFunction.call(null);
  /*Works back to IE 8*/
  window.onhashchange  = function(event) {
    var href = event.newURL.substring(event.newURL.indexOf('#')).replace('#', '');
    
    if( (event.newURL != event.oldURL)){
      /*Hide target node, we will unhide after compilation. Prevents seeing uncompiled template*/
      var targetId = (!_.isNullOrEmpty(State.target)) ? 
                      State.target.replace('#','') : 'apl-content',
          targetNode = document.getElementById(targetId);
          
      DOM.modifyClasses(targetNode,'apl-hide','');
      State.onloadFileQueue.push(href);
      DOM.asynGetPartial(href, Bootstrap.loadPartialIntoTemplate, State.target);
    }

  };

  Compile.compile( document.getElementsByTagName('body')[0], 'body' ); 
  var defaultHiddenNodeList = document.querySelectorAll('.apl-default-hidden');
  if(!_.isNull(defaultHiddenNodeList)){
    for(var i = 0; i < defaultHiddenNodeList.length; i++){
      defaultNodeToHide = defaultHiddenNodeList[i];
      DOM.modifyClasses(defaultNodeToHide,'','apl-default-hidden');
    }
  }

  _.log('Body COMPILATION DONE');
};


window['Templar'] = Templar;


});