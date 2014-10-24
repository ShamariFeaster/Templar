structureJS.module('Export', function(require){

var _ = this;
    DOM = require('DOM'),
    Map = require('Map'),
    State = require('State'),
    Bootstrap = require('Bootstrap'),
    Compile = require('Compile'),
    Templar = require('Templar'),
    Route = require('Route'),
    Interpolate = require('Interpolate'),
    Process = require('Process');

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
          targetNode = document.getElementById(targetId),
          resolvedRouteObject = null,
          NTDirectives = null,
          modelParts = null;
          
      if(State.hasDeclaredRoutes == true){
        try{
          resolvedRouteObject = Route.resolveRoute(href);
          href = (!_.isNullOrEmpty(resolvedRouteObject.partial)) ? 
                    resolvedRouteObject.partial : href;
          State.target = (!_.isNullOrEmpty(resolvedRouteObject.target)) ? 
                            resolvedRouteObject.target : State.target;
          NTDirectives = resolvedRouteObject.nonTerminalValues;
          
          for(var i = 0; i < NTDirectives.length; i++){
            modelParts = NTDirectives[i][0].split(':');
            Map.setAttribute(modelParts[0], modelParts[1], NTDirectives[i][1]);
            Interpolate.interpolate(modelParts[0], modelParts[1], NTDirectives[i][1] );
          }
          
        }catch(e){
          _.log(e);
        }
      }    
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