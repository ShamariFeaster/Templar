window.structureJS.module('Token', function(){

'use strict';

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

Token.prototype.equals = function(target){
  if(!_.isDef(target.fullToken)) return false;
  var normalized = target.fullToken.replace('{{','').replace('}}','');
  return (normalized == this.fullToken.replace('{{','').replace('}}',''));
};

return Token;

});