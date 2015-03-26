structureJS.module('Util', function(require){
  document.addEventListener('load', function(){
    console.log('LOAD FIRED!!!!!!!!!!!!!!!!!');
  });
  _ = Object.create(null);
  
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (_.isDef(a) && typeof a === 'string');};
  _.isFunc = function(a){ return (_.isDef(a) && typeof a === 'function');};
  _.isNull = function(a){ return (!_.isDef(a) || a == null);};
  _.isObject = function(a){ return (_.isDef(a) && Object.keys(a).length > 0);};
  _.isNullOrEmpty = function(a){ return (!_.isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!_.isNull(a) && Array.isArray(a))};
  _.log = function(a){console.log(a);};
  
  structureJS.extendContext(_); 
  return _;
});
