structureJS.module('TMP_Node', function(require){
var _ = this;
var TMP_Node = function(node, modelName, attribName, index){
  if(!(this instanceof TMP_Node))
    return new TMP_Node(node, id, modelName, attribName, index);
    
  this.node = node;
  this.modelName = modelName;
  this.attribName = attribName;
  this.index = (_.isDef(index))? index : -1;
  this.prop = '';
  this.symbolMap = Object.create(null);
  this.hasNonTerminals = false;
  this.embeddedControls = [];
  this.embeddedModelAttribs = Object.create(null);
  this.scope = '';
  this.hasAttributes = false;
  this.repeatModelName = '';
  this.repeatAttribName = '';
  this.repeatIndex = _.UNINDEXED;
  this.isComponent = false;
  this.componentName = '';
};

return TMP_Node;

});