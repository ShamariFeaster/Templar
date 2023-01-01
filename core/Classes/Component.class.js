structureJS.module('Component.class', function(require){

var _ = this;

var Component = function(attributes, onCreate, templateURL){
  if(!(this instanceof Component))
    return new Component();
    
  this.attributes = attributes || Object.create(null);
  this.onCreate = onCreate || function(){};
  this.templateURL = templateURL || '';
  this.templateContent = '';
  this.templateStyle = null;
  this.transclude = false;
};



return Component;

});