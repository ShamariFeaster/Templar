structureJS.module('Templar', function(require){

var _ = this;
var ControlNode = require('ControlNodeHeader');
var Map = require('Map');
var Route = require('Route');
var Model = require('ModelHeader');
var System = require('System');
var DOM = require('DOM');

var Templar = function(controlName){
  var control = new ControlNode(),
      lateBind = null;
      
  control.controlBaseNodes = Map.getBaseControls(controlName);
  /*This is primarily for repated controls which won't exist until AFTER interpolation. B/c they
    are objects we can bind an assignment that will happen later than the assignment in the controller.
    We late bind the binding of any listeners attached to controls. This is because those listeners will
    typically operate on children of a given control. Those children won't exist at the time of the client's
    listner bindings. By delaying the bind until the system notifies us all repeats are drawn (interpolation_done)
    , we can ensure that the client's listeners will have valid nodes to operate on.
    */
    
  var lateBind = (function(control, controlName){
      
      return function(){
        control.controlBaseNodes = Map.getBaseControls(controlName);
      };
    })(control, controlName);
    
  /*if interpolation_done already fired( ie, DOM is mature), immediately execute the lateBind*/
  lateBind.call(null);
  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, lateBind); 
    
  return control;
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

Templar.component = function(name, definitionObj){
  if(!_.isString(name) || !_.isDef(definitionObj)) return;
  
  var component = new Templar.Component();
  
  for(var prop in definitionObj){
    if(definitionObj.hasOwnProperty(prop)){
      switch(prop){
        case 'templateURL' :
          var url = definitionObj['templateURL'];
          
          if(!_.isNullOrEmpty(url)){
            component.templateURL = url;
            Templar._components.length++;
          }else{
            /*Throwing an error causes the rest of the code in whatever
            file is holding the bad compoent declaration to stop. However the
            loading of Templar is not halted b/c Export.js, which kicks off the
            bootstrap is another file, executed in it's own sandbox. I should
            have a system flag to 'bubble' up blocking errors to the bootstrap
            process instead of throwing errors at different places.*/
            _.log('Component "' + name + '" ignored. Declaration must have a URL.');
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
  
  Templar._components[name.toLowerCase()] = component;
  
  //blah
};

Templar.RouteObj = Route;
Templar.Map = Map;

window['Templar'] = Templar;
return Templar;

});