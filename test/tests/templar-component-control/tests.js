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
  
  QUnit.test('setAttribute Override', function(assert){
    $('#dialog1').attr('height', 100);
    assert.equal($('#dialog1').attr('style'),'font-size: 100px;','success');
  });
  
  QUnit.test('attribute interp using model attribs', function(assert){
    $('#attrib_up').click();
    assert.equal($('#dialog').attr('style'),'font-size: 51px;','user action performed 1');
    assert.equal($('#dialog').attr('height'),'51','attribute update correctly');
    
    $('#attrib_down').click();
    assert.equal($('#dialog').attr('style'),'font-size: 50px;','user action performed 2');
    assert.equal($('#dialog').attr('height'),'50','attribute update correctly');
  });
  
  QUnit.test('functions bound in onCreate worked; therefore onCreate working', function(assert){
    var $dialog = $('#dialog');
    $('#up', $dialog).click();
    assert.equal($dialog.attr('style'),'font-size: 51px;','success');
    
    $('#down', $dialog).click();
    assert.equal($dialog.attr('style'),'font-size: 50px;','success');
  });
  
});






