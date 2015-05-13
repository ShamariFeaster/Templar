window.structureJS.module('Attribute', function(){

"use strict";

var _ = this;

var Attribute = function(name){
  
  if(!(this instanceof Attribute)){
    return new Attribute();
  }

  this.onCreate = function(){};
  this.onChange = function(){};
  this.name = name || '';
};

var _isAttribute = function(name){
  var result = false;
  if(_.isString(name)){
    result = _.isDef(window.Templar._attributes[name]);
  }
  return result;
};

Attribute.prototype.getAttribute = function(name){
  var result = null,
      normalizedName = name.toLowerCase();
  if(_isAttribute(normalizedName)){
    result = window.Templar._attributes[normalizedName];
  }
  return result;
};

return Attribute;

});