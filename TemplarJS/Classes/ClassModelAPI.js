window.structureJS.module('ModelAPI', function(require){

'use strict';

var _ = this;
var Model = require('ModelHeader');
var Map = require('Map');
var Interpolate = require('Interpolate');
var Circular = window.structureJS.circular();
/************************GENERAL************************************/

Model.prototype.update = function(attribName){
  var tokens = Circular('Compile').getTokens(this.modelName + '.' + attribName, true);
  //for a targeted update, attribName will be some complex ref (a[a].current_selection)
  if(tokens.length > 0 && tokens[0].indexQueue.length > 0){
    Interpolate.targetedInterpolate(tokens);
  }else{
    Interpolate.interpolate(this.modelName, attribName, Map.getAttribute(this.modelName, attribName));
  }
};

/*public*/
Model.prototype.listen = function(attributeName, listener){
  
  if(!Map.isDuplicateListener(this.modelName, attributeName, listener)){
    Map.setListener(this.modelName, attributeName, listener);
  }
  
};

Model.prototype.onAssignment = function(attributeName, listener){
  this.listen(attributeName, function(e){
    if(Map.contains(e.type, _.MODEL_EVENT_TYPES.reassignment)){
      listener.call(null,e);
    }
  });
};

Model.prototype.onRepeatDone = function(attributeName, listener){
  var _this = this;
  this.listen(attributeName, function(e){

    if(Map.contains(e.type, _.SYSTEM_EVENT_TYPES.repeat_built) && 
      e.modelName == _this.modelName &&
      e.attribName == attributeName){
      listener.call(listener, e);
    }
  });
};

Model.prototype.unlisten = function(attributeName, func){
  if(_.isFunc(func)){
    Map.removeListener(this.modelName, attributeName, func);
  }else if(_.isString(attributeName)){
    Map.removeAllListeners(this.modelName, attributeName);
  }
  
};

Model.prototype.save = function(){

  var output = '';
  var attrib = null;
  
  if(!_.isDef(this.attributes.__meta__)){
    this.attributes.__meta__ = {};
  }
  
  for(var attribName in this.attributes){
  
    if(!this.attributes.hasOwnProperty(attribName)){ 
      continue;
    }
    
    if(!_.isArray(attrib = this.attributes[attribName])){ 
      continue;
    }
    
    for(var arrProp in attrib){
      
      if(!attrib.hasOwnProperty(arrProp)){ 
        continue;
      }
      
      if(!attrib.hasOwnProperty(arrProp) || _.isInt(arrProp)){ 
        continue;
      }
         
      if(!_.isDef(this.attributes.__meta__[attribName])){
        this.attributes.__meta__[attribName] = {};
      }

      this.attributes.__meta__[attribName][arrProp] = 
        (_.isString(attrib[arrProp])) ? attrib[arrProp] : JSON.stringify(attrib[arrProp]);
      
    }

  }
  
  output = JSON.stringify(this.attributes);
  delete this.attributes.__meta__;
  
  if(_.isDef(window.sessionStorage)){
    window.sessionStorage[this.modelName] = output;
  }
  
  return output;
};

Model.prototype.load = function(jsonString){

  var thawed = null;
  var thawFailed = false;
  var meta = null;
  var metaProp = null;
  var thawedItem = null;
  
  if(_.isDef(window.sessionStorage) && !_.isDef(jsonString)){
    jsonString = window.sessionStorage[this.modelName];
    window.sessionStorage.removeItem(this.modelName);
  }
  
  try{
    thawed = JSON.parse(jsonString);
  }catch(e){
    thawFailed = true;
  }
  
  if(thawFailed === true){
    _.log('ERROR: Frozen item was not proper JSON. Thaw failed.');
    return;
  }

  for(var prop in thawed){
    if(thawed.hasOwnProperty(prop) && prop != '__meta__'){
      this.attributes[prop] = thawed[prop];
    }
  }
  
  if(_.isDef(meta = thawed.__meta__)){
    /*Reinstate meta*/
    for(var prop2 in meta){
      
      if(!meta.hasOwnProperty(prop2)){ 
        continue;
      }
      
      metaProp = meta[prop2];
      
      for(var item in metaProp){
        
        if(!metaProp.hasOwnProperty(item)){ 
          continue;
        }
        
        if(_.isDef(this.attributes[prop2])){
          try{
            thawedItem = JSON.parse(metaProp[item]);
          }catch(e){
            thawedItem = metaProp[item];
          }
          if(item == '_value_'){
            this.attributes[prop2].current_selection = thawedItem;
          }
          this.attributes[prop2][item] = thawedItem;
        }
      }
      
    }
  }
  return this.attributes;
};

});