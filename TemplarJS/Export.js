window.structureJS.module('Export', function(require){

'use strict';

var _ = this;
var DOM = require('DOM');
var State = require('State');
var Bootstrap = require('Bootstrap');
var Compile = require('Compile');
var Templar = require('Templar');
var Route = require('Route');
var Link = require('Link');
var Interpolate = require('Interpolate');

var System = require('System');

/******Initialization*******/

function bootstrapComplete(msg){
  Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.framework_loaded);
  System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.framework_loaded);
  Bootstrap.bindTargetSetter();
  _.log('Running bootstrap Complete: ' + msg);
}

function beginBootstrap(scope){
  
  var resolvedRouteObj = null;
  var routeContentNode = null;
  var defaultKey = null;
  
  State.compiledScopes += scope + ',';
  
  if((resolvedRouteObj = Route.handleRoute(window.location.href)) !== null){
    if(!_.isNullOrEmpty(resolvedRouteObj.partial)){

      routeContentNode = document.getElementById(resolvedRouteObj.target);
      defaultKey = DOM.getDataAttribute(routeContentNode, _.IE_DEFAULT_ATTRIB_KEY);
      if(!_.isNull(routeContentNode) && !_.isNullOrEmpty(defaultKey)){
        routeContentNode.setAttribute('data-' + _.IE_DEFAULT_ATTRIB_KEY, '');
      }
      
      DOM.asynFetchRoutes(resolvedRouteObj, function(){
        _.log('asynFetchRoutes complete for ' + resolvedRouteObj.route);
        bootstrapComplete('ASYN FETCH ROUTES');
      });
      State.blockBodyCompilation = true;
    }
    
  }

  if(State.blockBodyCompilation === false){
    Compile.compile( document.getElementsByTagName('body')[0], scope ); 
    Link.bindModel( State.compiledScopes );
    bootstrapComplete('BODY COMPILATION');
  }else{
    _.log('WARNING: Body compilation has been blocked');
  }

}
    
window.structureJS.done(function(){
  if(typeof window.console === 'undefined'){
    window.console = { log : function(){} };
  }
  

  var scope = 'body ' + new Date().getTime();

  
  /*Bind onhashchange listener*/
  window.onhashchange  = function() {
    var resolvedRouteObj = null;
    /*Short-circuit if using Route.open()*/
    if(State.ignoreHashChange === true){
      State.ignoreHashChange = false;
      return;
    }

    if((resolvedRouteObj = Route.handleRoute(window.location.href)) !== null){
      DOM.asynFetchRoutes(resolvedRouteObj, function(){
        _.log('asynFetchRoutes complete for ' + resolvedRouteObj.route);
      });
    }
    
  };

  /*The length of _components indicated the # of valid declared components.
    Validity being determined by whether the delcariont obj had a template url*/
  var initComponentLength = Templar._components.length;
  
  var callback = function(){
    
    var component = this.targetNode;
    var container = document.createElement('div');
    var styles = container.getElementsByTagName('style');

    var head = document.getElementsByTagName('head')[0];
    
    State.compilationThreadCount--;
    container.innerHTML = this.responseText;
    /*This serves as flag that Compile.compile() uses to perform transclusion*/
    component.transclude = (container.getElementsByTagName('content').length > 0);
    /*Take the first style element from template and inject it into doc,
      remove it and subsequent style tags from template so they don't get injected
      in the wrong place (ie, not in head tag)*/
      
    for(var i = 0; i < styles.length; i++){
      
      if(i === 0){
        head.appendChild(styles[i]);
      }else{
        container.removeChild(styles[i]);
      }

    }
    
    component.templateContent = container.innerHTML;
    /*Kick off bottstrap when all components have been loaded*/
    if(--Templar._components.length < 1){
      beginBootstrap(scope);
    }
  };
  
  for(var cName in Templar._components){
    if(!Templar._components.hasOwnProperty(cName) ) continue;
    if(cName === 'length') continue;

    var component = Templar._components[cName];

    /*Fires off "threads" that fetch each component template. At the conclusion
    of template fetching, callback starts bootsrap process*/
    if(!_.isNullOrEmpty(component.templateURL)){
      DOM.asynGetPartial(component.templateURL,callback, '', component);
    }
  }
  /*IF there are no components to fetch, start bootsrap*/
  if(initComponentLength < 1){
    beginBootstrap(scope);
  }
  
});

});