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
      cModel.unlisten('searchInput');
      while($('#input').val() != ''){
        $input.sendkeys('{backspace}');
      }
    }
  });
  
  /*Helpers*/

  /*END Helpers*/
  /*
  Using https://github.com/dwachss/bililiteRange
          http://bililite.com/blog/
  */
  QUnit.asyncTest('Input interp 1',function( assert ){

    $input.sendkeys('t');
    $input.sendkeys('y');
    $input.sendkeys('{backspace}');
    QUnit.start();
    cModel.listen('searchInput', function(){
      assert.equal(cModel.searchInput, 't', 'Input model sequencing correct');
    })
    
  });
  
  QUnit.asyncTest('Input interp 2',function( assert ){

    $input.sendkeys('t');
    $input.sendkeys('{backspace}');
    QUnit.start();
    cModel.listen('searchInput', function(){
      assert.equal('',cModel.searchInput, 'Input model sequencing correct');
      
    })
    
  });

  
});






