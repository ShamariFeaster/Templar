window.structureJS.module('ModelHeader', function(){

"use strict";

var _ = this;
var Circular = window.structureJS.circular();

var Model = function(modelName ,modelObj){
  if(!(this instanceof Model)){
    return new Model(modelObj);
  }
  
  this.modelName = modelName;
  for(var attribName in modelObj){
    
    if(modelObj.hasOwnProperty(attribName)){
      Circular('Map').annotateWithLimitProps(this, attribName, modelObj[attribName]);
      
      Object.defineProperty(this, attribName, {
        /*Closure is needed to bind 'attribName' value to each get/set. If we use attribName from Model scope
          it will always be the last value of the iteration*/
        set : (function(attribName, model){
                return function(value){
                  _.log('Fired: ' + attribName + ' value ' + value);
                  var Map = Circular('Map');
                  var Interpolate = Circular('Interpolate');
                  //kill old static filter results as dataset has changed
                  if(_.isDef(model.filterResults[attribName])){
                    delete model.filterResults[attribName];
                  }
                  
                  //kill cached filter results as dataset has changed
                  if(_.isDef(model.cachedResults[attribName])){
                    delete model.cachedResults[attribName];
                  }
                  
                  // Expose page info on the attribute
                  Map.annotateWithLimitProps(model, attribName, value);
                  Map.setAttribute(model.modelName, attribName, value);
                  if(!Interpolate.interpolate(model.modelName, attribName, value)){
                    var updateObj = {};
                    var listeners = Map.getListeners(model.modelName, attribName);
                    updateObj.value = value;
                    updateObj.text = value;
                    updateObj.type = [_.MODEL_EVENT_TYPES.reassignment];
                    updateObj.properties = [];
                    Interpolate.dispatchListeners(listeners, updateObj);
                  }
                };
              })(attribName, this),
        get : (function(attribName, model){
                return function(){
                  return model.attributes[attribName];
                };
              })(attribName, this)
        
      });

    }
  }
  
  this.attributes = modelObj;
  
  //holde intra-filter results. eg, between subsequent 'and's of a filter() call
  this.cachedResults = {};
  this.filterResults = {};
  this.limitTable = {};
  this.liveFilters = {};
};

return Model;

});