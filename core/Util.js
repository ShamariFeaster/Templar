structureJS.module('Util', function(require){

  _ = Object.create(null);
  function isDef(a){
      return (typeof a !== 'undefined');
  }
  function isNull(a){
      return (a == null);
  }
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (isDef(a) && typeof a === 'string');};
  _.isFunc = function(a){ return (isDef(a) && typeof a === 'function');};
  _.isNull = function(a){ return (a == null);};
  _.isObject = function(a){ return (isDef(a) && Object.keys(a).length > 0);};
  _.isNullOrEmpty = function(a){ return (!isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!isNull(a) && Array.isArray(a))};
  _.log = function(a){console.log(a);};
  _.isInt = function(a){ return (isDef(a) && /^-?[0-9]+$/.test(a));};
  _.isObj = function(a){
      if (a === null || typeof a === 'undefined') { return false;}
      return ( (typeof a === 'function') || (typeof a === 'object') );
    };
  _.isTrue = function(a){ return (isDef(a) && a === true);};
  _.isFalse = function(a){ return (isDef(a) && a === false);};
  _.Default = function(a,b){ return (!isDef(a)) ? b : a;};
  _.mixin = function(from, to){
    for(var k in from){
      if(from.hasOwnProperty(k)){
        to[k] = from[k];
      }
    }
  };
  _.length = function(o){
    retVal = 0;
    if(_.isObj(o)){
      retVal = Object.keys(o).length;
    }
    return retVal;
  }
  structureJS.extendContext(_); 
  
  /* If structureJS depenedency resolver is missing we need to reassign */
  if(!isDef(structureJS.done)){
    Object.defineProperty(structureJS,'done',{
      set : function(val){

      },
      get : function(){
        return function(val){
          this.state['doneQueue'].push(val);
          var currOnload = window.onload || function(){};
          window.onload = function(){
            currOnload.call(null);
            val.call(null);
          }
        };
      }
    });
  }
  
  return _;
});
