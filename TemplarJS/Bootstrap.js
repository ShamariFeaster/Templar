structureJS.module('Bootstrap', function(require){


var _ = this;
var Map = require('Map');
var Link = require('Link');
var State = require('State');
var Compile = require('Compile');
var DOM = require('DOM');
var Route = require('Route'); 

var Bootstrap = {

  /*handlers with same handler are not duplicate bound. handler needs to be defined on persistent
    object or global scope*/
  setTarget : function(e){
    State.target = DOM.getDataAttribute(e.target, _.IE_TARGET_ATTRIB_KEY);
    State.target = (!_.isNullOrEmpty(State.target)) ? 
                        State.target : '';
  },
  
  fireOnloads : function(){
    var file = '',
        handlers = null;
    while( (file = State.onloadFileQueue.pop())){
      handlers = Templar.getPartialOnlodHandler(file);
      for(var i = 0; i < handlers.length; i++){
        handlers[i].call(null);
      }
    }
  },
  
  bindTargetSetter : function(){
    var aplLinkNodeList = document.getElementsByTagName('a');
        
    if(aplLinkNodeList != null){
      for(var i = 0; i < aplLinkNodeList.length; i++){
        aplLinkNodeList[i].addEventListener('click', this.setTarget);
      }
    }
    
  },
  /*Preloading audio players will hang the framework.*/
  loadPartialIntoTemplate : function(){
    /*Graceful fail on file not found. Error is logged from aync function*/
    if(this.status != 200) return;
    
    var partialContents = this.responseText,
        fileName = this.fileName,
        targetId = (!_.isNullOrEmpty(this.targetId)) ? 
                      this.targetId.replace('#','') : 'apl-content',
        targetNode = (!_.isNull(this.targetNode)) ? this.targetNode : null,
        /*a partial can define parent template dom elements to be hidden*/
        nodeToShow = null,
        href = document.location.href,
        timestamp = new Date().getTime(),
        scope = fileName +  ' ' + timestamp,
        /*These are for calls from DOM.asynFetchRoutes(). The context is set
          as the xhr object*/
        DOMGetFileContents = this.callback || function(){};
  
    if(!_.isNull(targetNode)){
      targetNode.innerHTML = partialContents;
    }else
    if((targetNode = document.getElementById(targetId)) != null){
      targetNode.innerHTML = partialContents;
    }else{
      /*Target node was not found, fallback*/
      _.log('WARNING: TARGET NODE NOT FOUND FOR ROUTE "'+this.route+'".');
      if(!_.isNullOrEmpty(this.fallback)){
        _.log('WARNING: ATTEMPTING FALLBACK ROUTE "'+this.fallback+'".');
        Route.open(this.fallback);
      }
      return;
    }

    _.log('Compiling <' + fileName + '> w/ scope <' + scope + '>');
    /*remove this pending comp*/
    State.compilationThreadCount--;
    State.compiledScopes += scope + ',';
    Compile.compile( targetNode, scope );

    /*if a default-template tag found, recursive compilations will be spun off async during compile()
      .without a way to determine if there are still unfinished 'threads' we will interpolate multiple
      times and prematurely causing unecessary overhead and misfiring of our onload handlers. Dangers of
      multiple interps is tearing down/rebuilding repeats which destroys control nodes causing control failure*/
    if(State.compilationThreadCount <= 0){
      Map.pruneNodeTreeByScope( State.compiledScopes ); 
      Link.bindModel( State.compiledScopes );
      Bootstrap.fireOnloads();
      Bootstrap.bindTargetSetter();
      State.compilationThreadCount = 0;
      DOMGetFileContents.call(this);
    }

  }
};

return Bootstrap;
});