QUnit.frameworkLoaded(function(){
  var cModel, Map, System, DOM, _, 
      $input = $('#input');
      
  QUnit.module('Input Elements', 
  {
    setup : function(){
      cModel = Templar.getModel('Comments');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      DOM = structureJS.require('DOM');
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

  
  QUnit.test('datalist test',function( assert ){
    assert.ok(true,'');
    
  });

  
});






