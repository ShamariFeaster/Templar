structureJS.module('Attribute', function(require){

var _ = this;

var Attribute = function(onCreate, onChange){
  if(!(this instanceof Attribute))
    return new Attribute();

  this.onCreate = onCreate || function(){};
  this.onChange = onChange|| function(){};

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