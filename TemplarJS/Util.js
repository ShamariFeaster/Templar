structureJS.module('Util', function(require){
  _ = Object.create(null);
  
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (!_.isDef(a) || typeof a === 'string');};
  _.isFunc = function(a){ return (!_.isDef(a) || typeof a === 'function');};
  _.isNull = function(a){ return (!_.isDef(a) || a == null);};
  _.isNullOrEmpty = function(a){ return (!_.isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!_.isNull(a) && typeof a !== 'string' && _.isDef(a.length))};
  _.log = function(a){console.log(a);};

  structureJS.extendContext(_); 
});
