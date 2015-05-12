window.structureJS.module('Templar', function(require){

'use strict';

var _ = this;
var Map = require('Map');
var Route = require('Route');
var Model = require('ModelHeader');
var System = require('System');
var DOM = require('DOM');
var Attribute = require('Attribute');
var Component = require('Component');

var Templar = function(){};

Templar._onloadHandlerMap = {};
Templar._components = {};
Templar._components.length = 0;

Templar._attributes = {};
Templar._attributes.length = 0;

Templar.addClass = function(node, className){
  DOM.modifyClasses(node, className, '');
};

Templar.removeClass = function(node, className){
  DOM.modifyClasses(node, '', className);
};

Templar.success = function(partialFileName, onloadFunction){
  var isUnique = true;
  var handler;
  
  if(!_.isDef(this._onloadHandlerMap[partialFileName])){
    this._onloadHandlerMap[partialFileName] = [];
  }
  
  if(_.isFunc(onloadFunction)){
  
    for(var i = 0; i < this._onloadHandlerMap[partialFileName].length; i++){
      handler = this._onloadHandlerMap[partialFileName][i];
      isUnique = isUnique && handler.toString() != onloadFunction.toString();
    }
    
    if(isUnique === true){
      this._onloadHandlerMap[partialFileName].push(onloadFunction);
    }
    
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

Templar.done = function(func){
  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.link_done, func);
};


Templar.attribute = function(name, definitionObj){
  if(!_.isString(name) || !_.isDef(definitionObj)) return;
  
  var attribute = new Attribute(name.toLowerCase());
  var onCreate = function(){};
  var onChange = function(){};
  
  for(var prop in definitionObj){
    if(definitionObj.hasOwnProperty(prop)){
      switch(prop){
        case 'onCreate' :
          onCreate = definitionObj.onCreate;
          attribute.onCreate = onCreate = (_.isFunc(onCreate)) ? onCreate : function(){};
          break;
        case 'onChange' :
          onChange = definitionObj.onCreate;
          attribute.onChange = onChange = (_.isFunc(onChange)) ? onChange : function(){};
          break;
      }
    }
  }
  attribute.onCreate = function(DOM_node){
    /*This implicit call to onChange is for when user uses a static value for the 
      attribute value. We assume he wants that value to be used to transform the
      target.*/
    attribute.onChange.call(attribute, DOM_node, DOM_node.getAttribute(attribute.name));
    onCreate.call(attribute, DOM_node);
  };
  Templar._attributes[attribute.name] = attribute;
};

Templar.component = function(name, definitionObj){
  if(!_.isString(name) || !_.isDef(definitionObj)) return;
  
  var component = new Component();
  
  for(var prop in definitionObj){
    if(definitionObj.hasOwnProperty(prop)){
      switch(prop){
        case 'templateURL' :
          component.templateURL = definitionObj.templateURL;
          
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
          var attribs = definitionObj.attributes;
          try{
            component.attributes = (_.isObject(attribs)) ? attribs : {};
            for(var attrib in component.attributes){
              if(!component.attributes.hasOwnProperty(attrib)) continue;
              component.attributes[attrib] = (_.isFunc(component.attributes[attrib])) ? 
                                                component.attributes[attrib] : 
                                                function(){};
            }
          }catch(e){
            /*Firefox throws type error on isObject*/
            _.log('Component "attributes" is not an object');
            component.attributes = {};
          }
          
          break;
        case 'onCreate' :
          var onCreate = definitionObj.onCreate;
          component.onCreate = (_.isFunc(onCreate)) ? onCreate : function(){};
          break;
        case 'onDone' :
          component.onDone = (_.isFunc(definitionObj.onDone)) ? definitionObj.onDone : null;
          break;
        case 'onChange' :
          component.onChange = (_.isFunc(definitionObj.onChange)) ? definitionObj.onChange : null;
          break;
        case 'onDestroy' :
          //Un-implemented
          component.onDestroy = (_.isFunc(definitionObj.onDestroy)) ? definitionObj.onChange : function(){};
          break;
        default:
          /* allowing component to have static functions and data  */
          component[prop] = definitionObj[prop];
          break;
      }
    }
  }
  
  if(!_.isNullOrEmpty(component.templateURL) && !_.isDef(Templar._components[name.toLowerCase()])){
    Templar._components[name.toLowerCase()] = component;
    Templar._components.length++;
  }else{
    _.log('WARNING: Component "' + name + '" is declared more than once. Only the last declaration will be used.');
  }

};


Templar.RouteObj = Route;
Templar.Map = Map;

window.Templar = Templar;
return Templar;

});