window.structureJS.module('Component', function(){
'use strict';

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

return Component;

});