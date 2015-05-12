window.structureJS.module('Bootstrap', function(require){

'use strict';

var _ = this;
var Map = require('Map');
var Link = require('Link');
var State = require('State');
var Compile = require('Compile');
var Route = require('Route'); 

var Bootstrap = {

  /* even if compilation epilogue fires early we will not fire onloads until whole
      route path has been walked*/
  fireOnloads : function(fileName){
    var file = '';
    var handlers = null;
    var onloadNames = fileName.split(',');
    var isInList = false;
    
    for(var i = 0; i < State.onloadFileQueue.length; i++){
      file = State.onloadFileQueue[i];
      
      for(var y  = 0; y < onloadNames.length; y++){
        isInList = isInList || onloadNames[y] == file;
      }
      
      if(isInList === true){
        file = State.onloadFileQueue.splice(i,1);
        handlers = window.Templar.getPartialOnlodHandler(file);
        _.log('Firing '+handlers.length +' handlers(s) for: ' + file);
        for(var x = 0; x < handlers.length; x++){
          handlers[x].call(null);
        }
        i--;
      }
    }
    _.log('Un-Fired on queue: ' + State.onloadFileQueue.toString());
  },

  /*Preloading audio players will hang the framework.*/
  loadPartialIntoTemplate : function(){

    /*Graceful fail on file not found. Error is logged from aync function*/
    if(this.status == 200){
      var partialContents = this.responseText;
      var fileName = this.fileName;
      var targetId = (!_.isNullOrEmpty(this.targetId)) ? 
                      this.targetId.replace('#','') 
                      : _.MAIN_CONTENT_ID;
      var targetNode = (_.isNotNull(this.targetNode)) ? this.targetNode : document.getElementById(targetId);
      //a partial can define parent template dom elements to be hidden
      var timestamp = new Date().getTime();
      var scope = fileName +  ' ' + timestamp;
      //These are for calls from DOM.asynFetchRoutes(). The context is set as the xhr object
      var DOMGetFileContents = this.callback || function(){};
  
      
      if(_.isNull(targetNode)){
        /*Target node was not found, fallback*/
        _.log('WARNING: TARGET NODE NOT FOUND FOR ROUTE "'+this.route+'".');
        if(!_.isNullOrEmpty(this.fallback)){
          _.log('WARNING: ATTEMPTING FALLBACK ROUTE "'+this.fallback+'".');
          Route.open(this.fallback);
        }
      }else{
        targetNode.innerHTML = partialContents;
        _.log('Compiling <' + fileName + '> w/ scope <' + scope + '>');
        /*remove this pending comp*/
        
        State.compiledScopes += scope + ',';
        Compile.compile( targetNode, scope );
        State.onloadFileQueue.unshift(this.fileName);
        /* on completion of route path walking the callback below resets this.fileName
            to be a comma-separated list of the route components that have been walked.
            this means we are ensured no onload is fired before it has been compiled and
            loaded.*/
        DOMGetFileContents.call(this);
        //State.compilationThreadCount--;
        /*if a default-template tag found, recursive compilations will be spun off async during compile()
          .without a way to determine if there are still unfinished 'threads' we will interpolate multiple
          times and prematurely causing unecessary overhead and misfiring of our onload handlers. Dangers of
          multiple interps is tearing down/rebuilding repeats which destroys control nodes causing control failure*/
        if(State.compilationThreadCount <= 0){
          Map.pruneNodeTreeByScope( State.compiledScopes ); 
          Link.bindModel( State.compiledScopes );
          Bootstrap.fireOnloads(this.fileName);
          State.compilationThreadCount = 0;
        }
      }

    } 

  }
};

return Bootstrap;
});