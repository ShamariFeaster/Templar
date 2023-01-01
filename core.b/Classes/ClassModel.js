structureJS.module('ModelHeader', function(require){

var _ = this;
var Circular = structureJS.circular();

var Model = function(modelName ,modelObj){
  if(!(this instanceof Model)){
    return new Model(modelObj);
  }

  this.modelName = modelName;
  for(var attribName in modelObj){
    
    if(modelObj.hasOwnProperty(attribName)){
      Circular('Map').annotateWithLimitProps(this, attribName, modelObj[attribName]);
      Object.defineProperty(this, attribName, {
        /*Closure is needed to bind 'attribName' value to each get/set. If we use attribName from Model scope
          it will always be the last value of the iteration*/
        set : (function(attribName, model){
                return function(value){
                  _.log('SET FIRED for ' + model.modelName + '.' + attribName);

                  /*kill old static filter results as dataset has changed*/
                  if(_.isDef(model.filterResults[attribName])){
                    delete model.filterResults[attribName];
                  }
                  
                  /*kill cached filter results as dataset has changed*/
                  if(_.isDef(model.cachedResults[attribName])){
                    delete model.cachedResults[attribName];
                  }
                  /* Expose page info on the attribute */
                  Circular('Map').annotateWithLimitProps(model, attribName, value);
                  Circular('Map').setAttribute(model.modelName, attribName, value);
                  Circular('Interpolate').interpolate(model.modelName, attribName, value);
                }
              })(attribName, this),
        get : (function(attribName, model){
                return function(){
                  return model.attributes[attribName];//Map.getAttribute(model.modelName, attribName);
                }
              })(attribName, this)
        
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