structureJS.module('Templar', function(require){

var _ = this;
var Map = require('Map');
var Route = require('Route');
var Model = require('ModelHeader');
var System = require('System');
var DOM = require('DOM');

var Templar = function(controlName){
};

Templar._onloadHandlerMap = Object.create(null);
Templar._components = Object.create(null);
Templar._components.length = 0;

Templar.Component = function(attributes, onCreate, templateURL){
  if(!(this instanceof Templar.Component))
    return new Templar.Component();
    
  this.attributes = attributes || Object.create(null);
  this.onCreate = onCreate || function(){};
  this.templateURL = templateURL || '';
  this.templateContent = '';
  this.templateStyle = null;
  this.transclude = false;
};

Templar.success = function(partialFileName, onloadFunction){
  if(!_.isDef(this._onloadHandlerMap[partialFileName])){
    this._onloadHandlerMap[partialFileName] = [];
  }
  
  if(_.isFunc(onloadFunction)){
    this._onloadHandlerMap[partialFileName].push(onloadFunction);
  }
  /*Success w/ no file name binds to framework_loaded system event. It should be
    noted that this will only be fired once after intial body compilation.*/
  if(_.isFunc(partialFileName)){
    System.setSystemListeners(_.SYSTEM_EVENT_TYPES.framework_loaded, function(){
    partialFileName.call(null);
  });
  }
};

Templar.getPartialOnlodHandler = function(partialFileName){
  var onloadHandlers = [];
  
  if(_.isDef(this._onloadHandlerMap[partialFileName])){
      onloadHandlers = this._onloadHandlerMap[partialFileName];
  }
  return onloadHandlers;
};

Templar.getModel = function(modelName){
  return Map.getModel(modelName);
};

Templar.dataModel = function(modelName, modelObj){
  Map.initModel(new Model(modelName, modelObj));
};

Templar.Route = function(routeObj){
  Route.buildRouteTree(routeObj);
};

Templar.setAuthorizer = function(func){
  Route.setAuthorizer(func);
};

Templar.setAuthenticator = function(func){
  Route.setAuthenticator(func);
};

Templar.setDeAuthenticator = function(func){
  Route.setDeAuthenticator(func);
};

Templar.component = function(name, definitionObj){
  if(!_.isString(name) || !_.isDef(definitionObj)) return;
  
  var component = new Templar.Component();
  
  for(var prop in definitionObj){
    if(definitionObj.hasOwnProperty(prop)){
      switch(prop){
        case 'templateURL' :
          component.templateURL = definitionObj['templateURL'];
          
          if(_.isNullOrEmpty(component.templateURL)){
            /*Throwing an error causes the rest of the code in whatever
            file is holding the bad compoent declaration to stop. However the
            loading of Templar is not halted b/c Export.js, which kicks off the
            bootstrap is another file, executed in it's own sandbox. I should
            have a system flag to 'bubble' up blocking errors to the bootstrap
            process instead of throwing errors at different places.*/
            _.log('WARNING: Component declaration for "' + name + '" ignored. Declaration must have a URL.');
          }
          
          break;
        case 'attributes' :
          var attribs = definitionObj['attributes'];
          try{
            component.attributes = (_.isObject(attribs)) ? attribs : Object.create(null);
            for(var attrib in component.attributes){
              component.attributes[attrib] = (_.isFunc(component.attributes[attrib])) ? 
                                                component.attributes[attrib] : 
                                                function(){};
            }
          }catch(e){
            /*Firefox throws type error on isObject*/
            _.log('Component "attributes" is not an object');
            component.attributes = Object.create(null);
          }
          
          break;
        case 'onCreate' :
          var onCreate = definitionObj['onCreate'];
          component.onCreate = (_.isFunc(onCreate)) ? onCreate : function(){};
          break;
      }
    }
  }
  
  if(!_.isNullOrEmpty(component.templateURL) && !_.isDef(Templar._components[name.toLowerCase()])){
    Templar._components[name.toLowerCase()] = component;
    Templar._components.length++;
  }
  
  //blah
};

Templar.RouteObj = Route;
Templar.Map = Map;

window['Templar'] = Templar;
return Templar;

});