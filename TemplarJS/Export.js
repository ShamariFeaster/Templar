structureJS.module('Export', function(require){

var _ = this;
    DOM = require('DOM'),
    Map = require('Map'),
    State = require('State'),
    Bootstrap = require('Bootstrap'),
    Compile = require('Compile'),
    Templar = require('Templar'),
    Route = require('Route'),
    Link = require('Link'),
    Interpolate = require('Interpolate'),
    Process = require('Process');

    /******Initialization*******/

function beginBootstrap(scope){
  var defaultNodeToHide;
  Compile.compile( document.getElementsByTagName('body')[0], scope ); 
  Link.bindModel( State.compiledScopes );
  Bootstrap.bindTargetSetter();
  
  var defaultHiddenNodeList = document.querySelectorAll('.apl-default-hidden');
  if(!_.isNull(defaultHiddenNodeList)){
    for(var i = 0; i < defaultHiddenNodeList.length; i++){
      defaultNodeToHide = defaultHiddenNodeList[i];
      DOM.modifyClasses(defaultNodeToHide,'','apl-default-hidden');
    }
  }
  
  _.log('Body COMPILATION DONE');
}
    
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
    var hashValue = '', resolvedRouteObj = null;
    if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
      State.onloadFileQueue.push(resolvedRouteObj.partial);
      DOM.asynGetPartial(resolvedRouteObj.partial, Bootstrap.loadPartialIntoTemplate, resolvedRouteObj.target);
    }else{
      hashValue = DOM.getHashValue(window.location.href);
      State.onloadFileQueue.push(hashValue);
      DOM.asynGetPartial(hashValue, Bootstrap.loadPartialIntoTemplate, State.target);
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
  
//Fetch components  
  
  var initComponentLength = Templar._components.length;
  
  for(cName in Templar._components){
    if(cName === 'length') continue;

    var component = Templar._components[cName],
        callback;
    
    callback = function(){
      var component = this.targetNode,
          container = document.createElement('div'),
          styles = container.getElementsByTagName('style'),
          style = null,
          head = document.getElementsByTagName('head')[0];;
      
      
      container.innerHTML = this.responseText;
      component.transclude = (container.getElementsByTagName('content').length > 0);
      
      for(var i = 0; i < styles.length; i++){
        
        if(i == 0){
          head.appendChild(styles[i]);
        }else{
          container.removeChild(styles[i]);
        }
       
        
      }
      
      component.templateContent = container.innerHTML;
      _.log(component.templateStyle);

      if(--Templar._components.length < 1){
        beginBootstrap(scope);
      };
    };
    
    if(!_.isNullOrEmpty(component.templateURL)){
      DOM.asynGetPartial(component.templateURL,callback, '', component);
    }
  }
  
  if(initComponentLength < 1){
    beginBootstrap(scope);
  }
  
});



});