/*
I learned that even though structureJS will synchronize when scripts are loaded, this is not enough
to guarantee that everything is truly synchronous. This is especially true of script that have 
asynchronous operation like Templar (fetching partials). window.onload will also not wait for 
asynchronous operation to complete before firing, making it and structureJS unreliable for e2e testing
of Templar features such as Controls in partials. structureJS is making sure my test script comes last, 
but if my test attempts to make use of a Control inside of a partial, the test may execute before that 
partial's DOM is mature. To counteract this, I extended Qunit to allow placement of tests into the
link_done system event. The interface for this is called QUnit.frameworkLoaded()

*/
QUnit.frameworkLoaded = function(callback){

  var _ = structureJS.state.context,
      System = structureJS.require('System');
  QUnit.config.autostart = false;
  
  /*we need tests to run after all late binds*/
  _.SYSTEM_EVENT_TYPES.LIST_TYPE = _.STACK;

  System.setSystemListeners(_.SYSTEM_EVENT_TYPES.link_done, function(){
    callback.call(null);
    QUnit.load();
    QUnit.start();
  });
  
};