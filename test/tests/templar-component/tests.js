QUnit.frameworkLoaded(function(){
  var tModel, _;
      
  QUnit.module('Checkbox Elements', 
  {
    setup : function(){
      tModel = Templar.getModel('test');

      _ = structureJS.config.context;
      
    },
    teardown : function(){

    }
  });
  
  /*Helpers*/

  /*END Helpers*/
  /*
  Using https://github.com/dwachss/bililiteRange
          http://bililite.com/blog/
  */
  
  console.log(Templar._components);

  
});






