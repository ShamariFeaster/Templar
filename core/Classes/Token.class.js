structureJS.module('Token', function(require){
var _ = this;
var Token = function(modelName, attribName){
  if(!(this instanceof Token))
    return new Token(modelName, attribName);
    
  this.start = '';
  this.end = '';
  this.fullToken = '';
  this.modelName = modelName || '';
  this.attribName = attribName || '';
  this.repeatModelName = '';
  this.repeatAttribName = '';
  this.repeatIndex = _.UNINDEXED;
  this.indexQueue = [];
};

return Token;

});