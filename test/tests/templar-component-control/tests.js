QUnit.frameworkLoaded(function(){
  var tModel, _;
      
  QUnit.module('Component replacement', 
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
  QUnit.test('Replacement successful', function( assert ){
    assert.equal($('#my-dialog').length, 1, 'replacement worked');
  });
  
  QUnit.test('Content Replacement successful', function( assert ){
    assert.equal($('.content').text().trim(), "Hello", 'content replacement worked');
  });
  
  QUnit.test('Stylesheet injection successful', function( assert ){
    assert.equal($('#component-style').length, 1, 'Stylesheet injection worked');
  });
});






