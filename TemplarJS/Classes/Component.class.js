window.structureJS.module('Component', function(){
'use strict';
var Circular = window.structureJS.circular();
var _ = this;
var Component = function(attributes, onCreate, templateURL){
  if(!(this instanceof Component))
    return new Component();
    
  this.attributes = attributes || {};
  this.onCreate = onCreate || function(){};
  this.templateURL = templateURL || '';
  this.templateContent = '';
  this.templateStyle = null;
  this.transclude = false;
};


Component.prototype.compile = function(DOM_root){
  Circular('Compile').compile(DOM_root, DOM_root.scope);
};

Component.prototype.dereference = function(NT){
  var tokens = Circular('Compile').getTokens(NT);
  var Map = Circular('Map');
  var values = [];
  for(var x = 0; x < tokens.length; x++){
    tokens[x].attribute = Map.dereferenceAttribute(tokens[x]);
    tokens[x].model = Map.getModel(tokens[x].modelName);
    tokens[x].data = {};
    values.push( tokens[x] );
  }
  return values;
};

Component.prototype.defineSelector = function(token, setter, initValue){
  if(_.isArray(token.attribute) && !_.isDef(token.attribute.noClobber)){
    token.attribute.noClobber = true;
    token.attribute._value_ = initValue || '';
    Object.defineProperty(token.attribute, 'current_selection',{
      set : function(value){ setter.call(token, value); },
      get : function(){ return token.attribute._value_; },
    });
    token.attribute.current_selection = token.attribute._value_;
  }else{
    _.log('WARNING: Selector binding failed b/c attribute is not array');
  }
};

return Component;

});