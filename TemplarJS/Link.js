structureJS.module('Link', function(require){

var _ = this;
var Map = require('Map');
var Interpolate = require('Interpolate');
var System = require('System');
return {
  
  bindModel : function(compiledScopes){
    var updateObj = Object.create(null);
    /*get model name names*/
    Map.forEach(function(ctx, modelName){
      /*get model attribute names*/
      Map.forEach(modelName, function(ctx, attribName){
        Interpolate.interpolate( ctx.modelName, ctx.modelAtrribName, 
                                  Map.getAttribute(ctx.modelName,ctx.modelAtrribName), compiledScopes);
      });
    });
    State.compiledScopes = '';
    /*Control listeners should not fire until this system event is finished. 
      TODO: interpolation_done name should be changed to 'pageLoaded' */
    Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done);
    System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done);
  }
};

});