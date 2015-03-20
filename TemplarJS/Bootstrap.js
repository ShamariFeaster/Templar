structureJS.module('Bootstrap', function(require){


var _ = this;
var Map = require('Map');
var Link = require('Link');
var State = require('State');
var Compile = require('Compile');
var DOM = require('DOM');

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
    var partialContents = this.responseText,
        fileName = this.fileName,
        targetId = (!_.isNullOrEmpty(this.targetId)) ? 
                      this.targetId.replace('#','') : 'apl-content',
        targetNode = (!_.isNull(this.targetNode)) ? this.targetNode : null,
        /*a partial can define parent template dom elements to be hidden*/
        aplHideNode = null,
        nodeToShow = null,
        defaultHiddenNodeList = null,
        defaultNodeToHide = null,
        href = document.location.href,
        timestamp = new Date().getTime(),
        scope = fileName +  ' ' + timestamp;
  
    if(!_.isNull(targetNode)){
      targetNode.innerHTML = partialContents;
    }else
    if((targetNode = document.getElementById(targetId)) != null){
      targetNode.innerHTML = partialContents;
    }

    aplHideNode = document.getElementById('apl-hide');
    
    /*Show nodes hidden from last partial load*/
      nodesPreviouslyHidden = State.aplHideList.split(_.CLASS_SEPARATOR);
      for(var i = 0; i < nodesPreviouslyHidden.length; i++){
          nodeToShow = document.getElementById(nodesPreviouslyHidden[i]);
          DOM.modifyClasses(nodeToShow,'apl-show','apl-show,apl-hide');
        }

    if(!_.isNull(aplHideNode)){
      State.aplHideList = aplHideNode.getAttribute('data-apl-hide');
      DOM.hideByIdList(State.aplHideList);
    }
    
    _.log('Compiling <' + fileName + '> w/ scope <' + scope + '>');
    /*remove this pending comp*/
    State.compilationThreadCount--;
    State.compiledScopes += scope + ',';
    Compile.compile( targetNode, scope );
    
    /*unhide target node after compilation*/
    DOM.modifyClasses(targetNode,'apl-show','apl-hide,apl-show');
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
    }

  }
};

return Bootstrap;
});