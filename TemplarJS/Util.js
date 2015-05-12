window.structureJS.module('Util', function(){
  'use strict';
  var _ = {};
  
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (_.isDef(a) && typeof a === 'string');};
  _.isFunc = function(a){ return (_.isDef(a) && typeof a === 'function');};
  _.isNull = function(a){ return (a === null);};
  _.isObject = function(a){ return (_.isDef(a) && Object.keys(a).length > 0);};
  _.isNullOrEmpty = function(a){ return (!_.isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!_.isNull(a) && Array.isArray(a));};
  _.log = function(a){console.log(a);};
  _.isInt = function(a){ return (_.isDef(a) && /^-?[0-9]+$/.test(a));};
  _.isObj = function(a){
      if (a === null || typeof a === 'undefined') { return false;}
      return ( (typeof a === 'function') || (typeof a === 'object') );
    };
  _.isNotNull = function(a){
    return _.isDef(a) && !_.isNull(a);
  };
  _.isTrue = function(a){ return (_.isDef(a) && a === true);};
  _.isFalse = function(a){ return (_.isDef(a) && a === false);};
  _.Default = function(a,b){ return (!_.isDef(a)) ? b : a;};
  _.mixin = function(from, to){
    for(var k in from){
      if(from.hasOwnProperty(k)){
        to[k] = from[k];
      }
    }
  };
  
  _.length = function(o){
    var retVal = 0;
    if(_.isObj(o)){
      retVal = Object.keys(o).length;
    }
    return retVal;
  };
  
  _.forIn = function(obj, func){
    for(var prop in obj){
      if(!obj.hasOwnProperty(prop)) continue;
      func.call(obj, prop);
    }
  };
  
  window.structureJS.extendContext(_); 
  
  /* If window.structureJS depenedency resolver is missing we need to reassign */
  if(!_.isDef(window.structureJS.done)){
    Object.defineProperty(window.structureJS,'done',{
      set : function(){},
      get : function(){
        return function(val){
          this.state.doneQueue.push(val);
          var currOnload = window.onload || function(){};
          window.onload = function(){
            currOnload.call(null);
            val.call(null);
          };
        };
      }
    });
  }
  
  return _;
});
