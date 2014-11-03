QUnit.frameworkLoaded = function(callback){
  var _ = structureJS.config.context,
      System = structureJS.require('System');
  QUnit.config.autostart = false;
  
  /*we need tests to run after all late binds*/
  _.SYSTEM_EVENT_TYPES.LIST_TYPE = _.STACK;

  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, function(){
    callback.call(null);
    QUnit.start();
  });
  
};