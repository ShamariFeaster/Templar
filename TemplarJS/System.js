structureJS.module('System', function(require){

var _ = this;
var Map = require('Map');

return {
  
  setSystemListeners : function(type, listener){
    var systemId = _.SYSTEM_EVENT_TYPES.system,
        _map = Map.getMap(),
        listenerObj = _map[systemId]['listeners'][systemId];
    if(_.isFunc(listener)){
      if(!_.isDef(listenerObj)){
        listenerObj = _map[systemId]['listeners'][systemId] = Object.create(null);
      }
      
      if(!_.isDef(listenerObj[type])){
        listenerObj[type] = [];
      }
      
      listenerObj[type].push(listener);

    }
  },
  
  getSystemListeners : function(type){
    var systemId = _.SYSTEM_EVENT_TYPES.system,
        _map = Map.getMap(),
        systemListnersObj = _map[systemId]['listeners'][systemId],
        listeners = [];
    if(!_.isNullOrEmpty(type)){
      if(_.isDef(systemListnersObj) && _.isDef(systemListnersObj[type])){
        listeners = systemListnersObj[type];
      }     
    }
    _.log(listeners.length);
    return listeners;
  },
  
  removeSystemListeners : function(type){
    var systemId = _.SYSTEM_EVENT_TYPES.system,
        _map = Map.getMap(),
        systemListnersObj = _map[systemId]['listeners'][systemId],
        listeners = [];
    if(!_.isNullOrEmpty(type)){
      if(_.isDef(systemListnersObj) && _.isDef(systemListnersObj[type])){
        delete systemListnersObj[type];
      }     
    }
  }
};

});