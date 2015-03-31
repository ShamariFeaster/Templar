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
    Process = require('Process'),
    System = require('System');;

    /******Initialization*******/

function beginBootstrap(scope){
  State.compiledScopes += scope + ',';

  if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
    if(!_.isNullOrEmpty(resolvedRouteObj.partial)){

      routeContentNode = document.getElementById(resolvedRouteObj.target);
      defaultKey = DOM.getDataAttribute(routeContentNode, _.IE_DEFAULT_ATTRIB_KEY);
      if(!_.isNull(routeContentNode) && !_.isNullOrEmpty(defaultKey)){
        routeContentNode.setAttribute('data-' + _.IE_DEFAULT_ATTRIB_KEY, '')
      }
      
      DOM.asynFetchRoutes(resolvedRouteObj, function(){
        _.log('asynFetchRoutes complete for ' + resolvedRouteObj.route);
      });
      State.blockBodyCompilation = true;
    }
    
  }

  if(State.blockBodyCompilation == false){
    Compile.compile( document.getElementsByTagName('body')[0], scope ); 
    Link.bindModel( State.compiledScopes );
  }else{
    _.log('WARNING: Body compilation has been blocked');
  }
  
  Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.framework_loaded);
  System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.framework_loaded);
  Bootstrap.bindTargetSetter();

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
  
  /*Bind onhashchange listener*/
  window.onhashchange  = function(event) {
    /*Short-circuit if using Route.open()*/
    if(State.ignoreHashChange === true){
      State.ignoreHashChange = false;
      return;
    }
    
    var hashValue = '', resolvedRouteObj = null;
    if((resolvedRouteObj = Route.handleRoute(window.location.href)) != null){
      DOM.asynFetchRoutes(resolvedRouteObj, function(){
        _.log('asynFetchRoutes complete for ' + resolvedRouteObj.route);
      });
    }else{
      hashValue = DOM.getHashValue(window.location.href);
      State.onloadFileQueue.push(hashValue);
      DOM.asynGetPartial(hashValue, Bootstrap.loadPartialIntoTemplate, State.target);
    }
    
  };
  

  /*The length of _components indicated the # of valid declared components.
    Validity being determined by whether the delcariont obj had a template url*/
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
      /*This serves as flag that Compile.compile() uses to perform transclusion*/
      component.transclude = (container.getElementsByTagName('content').length > 0);
      /*Take the first style element from template and inject it into doc,
        remove it and subsequent style tags from template so they don't get injected
        in the wrong place (ie, not in head tag)*/
        
      for(var i = 0; i < styles.length; i++){
        
        if(i == 0){
          head.appendChild(styles[i]);
        }else{
          container.removeChild(styles[i]);
        }
       
        
      }
      
      component.templateContent = container.innerHTML;
      /*Kick off bottstrap when all components have been loaded*/
      if(--Templar._components.length < 1){
        beginBootstrap(scope);
      };
    };
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