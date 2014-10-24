structureJS.module('Templar', function(require){

var _ = this;
var ControlNode = require('ControlNodeHeader');
var Map = require('Map');
var Route = require('Route');
var Model = require('ModelHeader');
var System = require('System');

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
    
  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, lateBind); 
    
  return control;
};

Templar._onloadHandlerMap = Object.create(null);

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
Templar.RouteObj = Route;
Templar.Map = Map;


return Templar;

});