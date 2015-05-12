window.structureJS.module('TMP_Node', function(){

'use strict';

var _ = this;

var TMP_Node = function(node, modelName, attribName, index){
  if(!(this instanceof TMP_Node))
    return new TMP_Node(node, modelName, attribName, index);
    
  this.node = node;
  this.modelName = modelName;
  this.attribName = attribName;
  this.index = (_.isDef(index))? index : -1;
  this.symbolMap = {};
  this.hasNonTerminals = false;
  this.embeddedModelAttribs = {};
  this.embeddedRepeats = {};
  this.scope = '';
  this.hasAttributes = false;
  this.repeatModelName = '';
  this.repeatAttribName = '';
  this.repeatIndex = _.UNINDEXED;
  this.isComponent = false;
  this.componentName = '';
  this.indexQueue = [];
  this.token = {};
  this.fullToken = '';
};

TMP_Node.prototype.inheritToken = function(Token){
  if(_.isDef(Token)){
    this.modelName = Token.modelName;
    this.attribName = Token.attribName;
    this.repeatModelName = Token.repeatModelName ;
    this.repeatAttribName = Token.repeatAttribName ;
    this.repeatIndex = Token.repeatIndex;
    this.indexQueue = Token.indexQueue.slice(0);
    this.fullToken = Token.fullToken;
  }
};

return TMP_Node;

});