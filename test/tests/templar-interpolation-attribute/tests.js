/*
QUnit.asyncTest( 'Multiple onloads', function( assert ) {
  expect( 7 );
  var cModel = Templar.getModel('Comments'),
      eModel =  Templar.getModel('Environment');
  Templar.success('partial-login-screen.html', function(){
    assert.ok(true,'multi-partial on same screen loaded 1');
    assert.equal(cModel.selectedComment, $('#selectedComment').text(),'interp 1');
    QUnit.start();
    
  }); 
  
  Templar.success('partial-single-nitework.html', function(){
    assert.ok(true,'multi-partial on same screen loaded 2');
    assert.equal(eModel.time, $('#time').text(),'interp 2');
  }); 
  
  Templar.success('partial-home-screen.html', function(){
    assert.ok(true, 'embedded partial loaded');
    assert.equal(eModel.image_templar, $('#image_templar').text(),'interp 3');
    assert.equal(eModel.host, $('#host').text(),'interp 4');
  });
});
*/


QUnit.frameworkLoaded(function(){
  var aModel, Map, System, DOM, _, 
      $div = null;
  QUnit.module('Selects', 
  {
    setup : function(){
      aModel = Templar.getModel('Attributes');
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
  
  QUnit.test('Attribute Interpolation',function( assert ){
    $div = $('#' + aModel.id);
    
    assert.equal($div.attr('title'), aModel.title, 'title attrib correctly interped');
    assert.equal($div.attr('name'), aModel.name, 'name attrib correctly interped');
    assert.equal($div.attr('class'), aModel.expected_result_class, 'class correctly not interped');
    assert.equal($div.attr('style'), aModel.expected_result_style, 'style correctly not interped');
    assert.equal($div.data('test'), aModel.data_test, 'data attrib correctly interped');
    assert.equal($div.attr('id'), aModel.id, 'id attrib correctly interped');
  });

  QUnit.test('Attribute Interpolation in repeat + $index repeat property',function( assert ){
    for(var i = 0; i < aModel.range.length; i++){
      
      $div = $('#' + aModel.id + '-' + i);
      assert.equal($div.attr('title'), aModel.title, 'title attrib correctly interped');
      assert.equal($div.attr('name'), aModel.name, 'name attrib correctly interped');
      assert.equal($div.attr('class'), aModel.expected_result_class, 'class correctly not interped');
      assert.equal($div.attr('style'), aModel.expected_result_style, 'style correctly not interped');
      assert.equal($div.data('test'), aModel.data_test, 'data attrib correctly interped');
      assert.equal($div.attr('id'), aModel.id + '-' + i, 'id attrib correctly interped');
     
    }
  });
   
  QUnit.test('Repeat {{}} property for scalar arrays',function( assert ){
    for(var i = 0; i < aModel.range.length; i++){
      
      $div = $('#bracket-' + i);
      assert.equal($div.text(), aModel.range[i], 'element ' + i + ' interped correctly' );
    }
  });

  QUnit.test('non-scalar arrays',function( assert ){
    for(var i = 0; i < aModel.non_scalar.length; i++){
      
      $div = $('#non-scalar-' + i);
      assert.equal($div.attr('title'), aModel.non_scalar[i].value, 'element ' + i + ' value prop interped correctly' );
      assert.equal($div.text(), aModel.non_scalar[i].text, 'element ' + i + ' text prop interped correctly' );
    }
  });
});






