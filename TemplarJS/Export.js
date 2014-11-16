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

structureJS.done(function(){
  if(!_.isDef( console )){
    console = { log : function(){} };
  }
  var aplContentNode = document.getElementById('apl-content'),
      scope = 'body ' + new Date().getTime(),
      resolvedRouteObj = null,
      routeContentNode = null,
      defaultKey = '';

  window.onhashchange  = function(event) {

    if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
      State.onloadFileQueue.push(resolvedRouteObj.partial);
      DOM.asynGetPartial(resolvedRouteObj.partial, Bootstrap.loadPartialIntoTemplate, resolvedRouteObj.target);
    }else{
      State.onloadFileQueue.push(window.location.href);
      DOM.asynGetPartial(DOM.getHashValue(window.location.href), Bootstrap.loadPartialIntoTemplate, State.target);
    }
    
  };
  State.compiledScopes += scope + ',';

  if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
    if(!_.isNullOrEmpty(resolvedRouteObj.partial)){

      routeContentNode = document.getElementById(resolvedRouteObj.target);
      defaultKey = DOM.getDataAttribute(routeContentNode, _.IE_DEFAULT_ATTRIB_KEY);
      if(!_.isNull(routeContentNode) && !_.isNullOrEmpty(defaultKey)){
        routeContentNode.setAttribute('data-' + _.IE_DEFAULT_ATTRIB_KEY, '')
      }
      
      State.onloadFileQueue.push(resolvedRouteObj.partial);
      DOM.asynGetPartial(resolvedRouteObj.partial, Bootstrap.loadPartialIntoTemplate, resolvedRouteObj.target);
      
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
});



});