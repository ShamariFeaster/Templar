structureJS.module('TMP_Node', function(require){
var _ = this;
var TMP_Node = function(node, modelName, attribName, index){
  if(!(this instanceof TMP_Node))
    return new TMP_Node(node, id, modelName, attribName, index);
    
  this.node = node;
  this.modelName = modelName;
  this.attribName = attribName;
  this.index = (_.isDef(index))? index : -1;
  this.symbolMap = Object.create(null);
  this.hasNonTerminals = false;
  this.embeddedModelAttribs = Object.create(null);
  this.scope = '';
  this.hasAttributes = false;
  this.repeatModelName = '';
  this.repeatAttribName = '';
  this.repeatIndex = _.UNINDEXED;
  this.isComponent = false;
  this.componentName = '';
  this.indexQueue = [];
  this.token = {};
};

TMP_Node.prototype.inheritToken = function(Token){
  this.modelName = Token.modelName;
  this.attribName = Token.attribName;
  this.repeatModelName = Token.repeatModelName ;
  this.repeatAttribName = Token.repeatAttribName ;
  this.repeatIndex = Token.repeatIndex;
  this.indexQueue = Token.indexQueue.slice(0);
}

return TMP_Node;

});