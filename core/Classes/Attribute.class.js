structureJS.module('Attribute.class', function(require){

var _ = this;

var Attribute = function(name){
  if(!(this instanceof Attribute))
    return new Attribute();

  this.onCreate = function(){};
  this.onChange = function(){};
  this.name = name || '';
};

var _isAttribute = function(name){
  var result = false;
  if(_.isString(name)){
    result = _.isDef(Templar._attributes[name]);
  }
  return result;
}

Attribute.prototype.getAttribute = function(name){
  var result = null;
  if(_isAttribute(name)){
    result = Templar._attributes[name];
  }
  return result;
}

return Attribute;

});