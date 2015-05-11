window.structureJS.module('Link', function(require){

'use strict';

var _ = this;
var Map = require('Map');
var Interpolate = require('Interpolate');
var System = require('System');
var State = require('State');

return {
  
  bindModel : function(compiledScopes){

    /*get model name names*/
    Map.forEach(function(ctx){
      /*get model attribute names*/
      Map.forEach(ctx.modelName, function(ctx){
        Interpolate.interpolate( ctx.modelName, ctx.modelAtrribName, 
                                  Map.getAttribute(ctx.modelName,ctx.modelAtrribName), compiledScopes);
      });
    });
    State.compiledScopes = '';
    /*Control listeners should not fire until this system event is finished. 
      TODO: interpolation_done name should be changed to 'pageLoaded' */
    Interpolate.dispatchSystemListeners(_.SYSTEM_EVENT_TYPES.link_done);
    System.removeSystemListeners(_.SYSTEM_EVENT_TYPES.link_done);
  }
};

});