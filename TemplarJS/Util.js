structureJS.module('Util', function(require){
  _ = Object.create(null);
  
  _.isDef = function(a){return (typeof a !== 'undefined');};
  _.isString = function(a){ return (!_.isDef(a) || typeof a === 'string');};
  _.isFunc = function(a){ return (!_.isDef(a) || typeof a === 'function');};
  _.isNull = function(a){ return (!_.isDef(a) || a == null);};
  _.isNullOrEmpty = function(a){ return (!_.isDef(a) || (a === null || a === ''));};
  _.isArray = function(a){return (!_.isNull(a) && typeof a !== 'string' && _.isDef(a.length))};
  _.log = function(a){console.log(a);};
  _.getDataAttribute = function(DOM_Node, attributeKey){
    var parts = (_.isString(attributeKey)) ? attributeKey.split('-') : [];
    var value = null;
    /*camelcase from the first word on*/
    var camelCaseKey = parts.slice(0,1).concat(parts.slice(1).map(function(part){
      return part.charAt(0).toUpperCase() + part.slice(1);
    })).join('');
    
    value = (!_.isNull(DOM_Node) && _.isDef(DOM_Node.dataset)) ? 
          DOM_Node.dataset[camelCaseKey] :
          DOM_Node.getAttribute('data-' + attributeKey);
    return (_.isNull(value)) ? '' : value;
  }

  structureJS.extendContext(_); 
});
