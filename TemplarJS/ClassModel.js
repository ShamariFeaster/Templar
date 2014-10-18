structureJS.module('ModelHeader', function(require){

var _ = this;
var Map = require('Map');
var Interpolate = require('Interpolate');


var Model = function(modelName ,modelObj){
  if(!(this instanceof Model)){
    return new Model(modelObj);
  }

  this.modelName = modelName;
  for(var attrib in modelObj){
    
    if(modelObj.hasOwnProperty(attrib)){

      Object.defineProperty(this, attrib, {
        /*Closure is needed to bind 'attrib' value to each get/set. If we use attrib from Model scope
          it will always be the last value of the iteration*/
        set : (function(attrib, model){
                return function(value){
                  _.log('SET FIRED for ' + model.modelName + '.' + attrib);
                  /* Since clobber assignment request - clear attribute meta-data
                  
                  kill old limit and page num on reassingment*/
                  if(_.isDef(model.limitTable[attrib])){
                    delete model.limitTable[attrib];
                  }
                  
                  /*kill old static filter results as dataset has changed*/
                  if(_.isDef(model.filterResults[attrib])){
                    delete model.filterResults[attrib];
                  }
                  
                  /*kill cached filter results as dataset has changed*/
                  if(_.isDef(model.cachedResults[attrib])){
                    delete model.cachedResults[attrib];
                  }
                  
                  Map.setAttribute(model.modelName, attrib, value);
                  Interpolate.interpolate(model.modelName, attrib, value);
                }
              })(attrib, this),
        get : (function(attrib, model){
                return function(){
                  return Map.getAttribute(model.modelName, attrib);
                }
              })(attrib, this)
        
      });

    }
  }
  
  this.attributes = modelObj;
  /*holde intra-filter results. eg, between subsequent 'and's of a filter() call */
  this.cachedResults = Object.create(null);
  this.filterResults = Object.create(null);
  this.limitTable = Object.create(null);
  this.liveFilters = Object.create(null);
};

return Model;

});