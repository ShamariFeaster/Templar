structureJS.module('Util', function(require){

  _ = Object.create(null);
  
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (_.isDef(a) && typeof a === 'string');};
  _.isFunc = function(a){ return (_.isDef(a) && typeof a === 'function');};
  _.isNull = function(a){ return (!_.isDef(a) || a == null);};
  _.isObject = function(a){ return (_.isDef(a) && Object.keys(a).length > 0);};
  _.isNullOrEmpty = function(a){ return (!_.isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!_.isNull(a) && Array.isArray(a))};
  _.log = function(a){console.log(a);};
  _.isInt = function(a){ return (_.isDef(a) && /^-?[0-9]+$/.test(a));};
  _.isObj = function(a){
      if (a === null || typeof a === 'undefined') { return false;}
      return ( (typeof a === 'function') || (typeof a === 'object') );
    };
  _.mixin = function(from, to){
    for(var k in from){
      if(from.hasOwnProperty(k)){
        to[k] = from[k];
      }
    }
  };
  structureJS.extendContext(_); 
  return _;
});
