structureJS.module('ControlNodeHeader', function(require){
var _ = this;

var ControlNode = function(node, id, modelName, attribName, index){
  if(!(this instanceof ControlNode))
    return new ControlNode(node, id, modelName, attribName, index);
  
  var thisChild = null;
  this.node = _.isDef(node) ? node : null;
  this.id = _.isDef(id) ? id : '';
  this.modelName = _.isDef(modelName) ? modelName : '';
  this.attribName = _.isDef(attribName) ? attribName : '';
  this.index = (_.isDef(index))? index : -1;
  this.scope = '';
  this.childIds = Object.create(null);
  this.controlBaseNodes = [];

  /*child nodes keyed on their ids*/
  if(!_.isNull(this.node)){
    for(var x = 0; x < this.node.children.length; x++){
      if(!_.isNullOrEmpty(this.node.children[x].id)){
        /*children are wrapped so they can use ControlNode functions. Children also should put
        themselves on the controlBaseNodes property. This is so indexedWrapper() will work as expected*/
        thisChild = new ControlNode(this.node.children[x]);
        thisChild.controlBaseNodes.push(thisChild)
        this.childIds[this.node.children[x].id] = thisChild;
      }
    }
  }
  
};

return ControlNode;
});