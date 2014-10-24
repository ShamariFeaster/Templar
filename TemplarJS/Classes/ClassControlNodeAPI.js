structureJS.module('ControlNodeAPI', function(require){
var _ = this;
var ControlNode = require('ControlNodeHeader');
var DOM = require('DOM');
var Map = require('Map');
var System = require('System');
ControlNode.prototype.indexedWrapper = function(index, funct){
  if(_.isDef(index) && index < this.controlBaseNodes.length){
    funct.call(null, this.controlBaseNodes[index]);
  }
  else {
    for(var i = 0; i < this.controlBaseNodes.length; i++){
      funct.call(null, this.controlBaseNodes[i]);
    }
  }
};

ControlNode.prototype.hide = function(index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, 'apl-hide', 'apl-show');
  });
};

ControlNode.prototype.show = function(index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, 'apl-show', 'apl-hide');
  });
};

ControlNode.prototype.addClass = function(addClass, index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, addClass, '');
  });
};

ControlNode.prototype.removeClass = function(removeClass, index){
  this.indexedWrapper(index, function(controlNode){
    DOM.modifyClasses(controlNode.node, '', removeClass);
  });
};

ControlNode.prototype.listenTo = function(childName){
  
  var chain = Object.create(null),
      Control = this;
      
  chain.forEvent = function(eventType, handler){
    /*For notes on what's happening here see Templar()*/
    var lateBind = (function(eventType, handler, childName, Control){
    
      var thisControlNode = null,
          thisChildNode = null;
          
      return function(){
        if(_.isDef(childName)
           && !_.isNull(Control.controlBaseNodes)
           && _.isDef(Control.controlBaseNodes[0])
           && _.isDef(Control.controlBaseNodes[0].childIds[childName])){
          
            for(var i = 0; i < Control.controlBaseNodes.length; i++){
              thisControlNode = Control.controlBaseNodes[i];
              
              for(var id in thisControlNode.childIds){
                
                if(id == childName){
                
                  thisChildNode = thisControlNode.childIds[id].node;
                  (function(handler, i, thisChildNode, thisControlNode){
                    
                    thisChildNode.addEventListener(eventType, function(e){
                      thisControlNode.childIds.event = e;
                      handler.call(null, thisControlNode.childIds, i);
                    });
                    
                  })(handler, i, thisChildNode, thisControlNode);

                }
                  
                  
              }
            }

          }
      };
    })(eventType, handler, childName, Control);
    
    System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, lateBind);
    
  };
  
  return chain;
};

/*Will not work in client's onload functions. It will work in event-based functions. Shouldn't publish 
  in version 1 API.*/
ControlNode.prototype.forEach = function(func){
  var chain = Object.create(null),
      Control = this;
      
  if(_.isNull(Control.controlBaseNodes))
    return;
  for(var i = 0; i < Control.controlBaseNodes.length; i++){
    func.call(null, i, Control.controlBaseNodes[i], Control.controlBaseNodes[i].childIds);
  }
};

ControlNode.prototype.listen = function(eventType, handler){
  var Control = this;
  var lateBind = (function(eventType, handler, Control){
      
      return function(){
        var thisBaseNode = null,
            thisChildNode = null;
            
        if(!_.isNullOrEmpty(eventType) && _.isFunc(handler) && !_.isNull(Control.controlBaseNodes)){
        
          for(var i = 0; i < Control.controlBaseNodes.length; i++){

            (function(handler, i){
              
              Control.controlBaseNodes[i].node.addEventListener(eventType, function(e){
                Control.controlBaseNodes[i].childIds.event = e;
                handler.call(null, Control.controlBaseNodes[i].childIds, i);  
              });
              
            })(handler, i);
          }
          
          
        }
      };
    })(eventType, handler, Control);
  
  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, lateBind);
  
  
};


});