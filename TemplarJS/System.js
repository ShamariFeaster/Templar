window.structureJS.module('System', function(require){

'use strict';

var _ = this;
var Map = require('Map');

return {
  
  setSystemListeners : function(type, listener){
    var systemId = _.SYSTEM_EVENT_TYPES.system;
    var _map = Map.getMap();
    var listenerObj = _map[systemId].listeners[systemId];
    
    if(_.isFunc(listener)){
      if(!_.isDef(listenerObj)){
        listenerObj = _map[systemId].listeners[systemId] = {};
      }
      
      if(!_.isDef(listenerObj[type])){
        listenerObj[type] = [];
      }
      
      listenerObj[type].push(listener);

    }
  },
  
  getSystemListeners : function(type){
    var systemId = _.SYSTEM_EVENT_TYPES.system;
    var _map = Map.getMap();
    var systemListnersObj = _map[systemId].listeners[systemId];
    var listeners = [];
    
    if(!_.isNullOrEmpty(type)){
      if(_.isDef(systemListnersObj) && _.isDef(systemListnersObj[type])){
        listeners = systemListnersObj[type];
      }     
    }
    return listeners;
  },
  
  removeSystemListeners : function(type){
    var systemId = _.SYSTEM_EVENT_TYPES.system;
    var _map = Map.getMap();
    var systemListnersObj = _map[systemId].listeners[systemId];
    
    if(!_.isNullOrEmpty(type)){
      if(_.isDef(systemListnersObj) && _.isDef(systemListnersObj[type])){
        delete systemListnersObj[type];
      }     
    }
  }
};

});