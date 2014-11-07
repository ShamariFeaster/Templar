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
  var aplContentNode = document.getElementById('apl-content'),
      scope = 'body ' + new Date().getTime(),
      resolvedRouteObj = null,
      routeContentNode = null;
  
  existingOnloadFunction.call(null);
  
  /*Works back to IE 8*/
  window.onhashchange  = function(event) {
  
    if( (event.newURL != event.oldURL)){
      Route.handleRoute(event.newURL);
    }

  };
  State.compiledScopes += scope + ',';
  /*If we see a route on page load, kill any default on target of this route.*/
  if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
    if(!_.isNullOrEmpty(resolvedRouteObj.target) && !_.isNullOrEmpty(resolvedRouteObj.partial)){
      /*get target node*/
      routeContentNode = document.getElementById(resolvedRouteObj.target);
      if(!_.isNull(routeContentNode) && _.isDef(routeContentNode.dataset.aplDefault)){
        routeContentNode.dataset.aplDefault = '';
      }
    }else{
      aplContentNode.dataset.aplDefault = '';
    }
    
  }
    
    
  Compile.compile( document.getElementsByTagName('body')[0], scope ); 
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