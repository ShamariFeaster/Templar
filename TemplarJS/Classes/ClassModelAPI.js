structureJS.module('ModelAPI', function(require){

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');

/************************GENERAL************************************/
/*Non-clobbering updating of interface using new data. Note that */
/*public*/
Model.prototype.softset = function(attribName, value){
  this.cachedResults[attribName] = value;
  Interpolate.interpolate(this.modelName, attribName, value);
  delete this.cachedResults[attribName];
  if(_.isDef(this.limitTable[attribName])){
    this.limitTable[attribName].page = 1;
  }
};

Model.prototype.update = function(attribName){
  Interpolate.interpolate(this.modelName, attribName, Map.getAttribute(this.modelName, attribName));
};
/*public*/
Model.prototype.listen = function(attributeName, listener){
  if(!Map.isDuplicateListener(this.modelName, attributeName, listener))
    Map.setListener(this.modelName, attributeName, listener);
};



});