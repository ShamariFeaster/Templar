QUnit.frameworkLoaded(function(){
  var tModel, _, 
      $simplecb = $('[name="checkbox"]'),
      $complexcb = $('[name="complex_checkbox"]'),
      $repeatcb = $('[name="repeat_checkbox"]');
      $attribCbA = $('[name="cba"]');
      $attribCbB = $('[name="cbb"]');
      
  QUnit.module('Checkbox Elements', 
  {
    setup : function(){
      tModel = Templar.getModel('test');

      _ = structureJS.config.context;
      
    },
    teardown : function(){
      tModel.unlisten('checkbox');
    }
  });
  
  /*Helpers*/

  /*END Helpers*/
  /*
  Using https://github.com/dwachss/bililiteRange
          http://bililite.com/blog/
  */
  
  QUnit.test('simple checkbox interp',function( assert ){
    $simplecb.each(function(i,el){
      assert.equal(el.getAttribute('value'),tModel.checkbox[i],'simple interp working ' + i);
      assert.equal(el.nextSibling.wholeText,tModel.checkbox[i],'simple description interp working ' + i);
    });
    
  });
  
  QUnit.test('complex checkbox interp',function( assert ){
    $complexcb.each(function(i,el){
      assert.equal(el.getAttribute('value'),tModel.complex_checkbox[i].value,'complex interp working ' + i);
      assert.equal(el.nextSibling.wholeText,tModel.complex_checkbox[i].description,'complex description interp working ' + i);
    });

  });
  
  QUnit.asyncTest('simple checkbox listener',function( assert ){
    tModel.listen('checkbox', function(e){
      assert.equal(e.value, 'yellow', 'simple checkbox event fired correctly: value');
      assert.equal(e.checked, true, 'simple checkbox event fired correctly: checked');
    });
    
    $simplecb[0].click();
    QUnit.start();
  });

  QUnit.asyncTest('complex checkbox listener',function( assert ){
    tModel.listen('complex_checkbox', function(e){
      assert.equal(e.value, 'yellow', 'complex checkbox event fired correctly: value');
      assert.equal(e.checked, true, 'complex checkbox event fired correctly: checked');
    });
    
    $complexcb[0].click();
    QUnit.start();
  });
  
  QUnit.test('checkbox using attribute interpolation',function( assert ){
    $('.cba:visible').each(function(i,el){
      assert.equal(el.getAttribute('value'),tModel.form1[i]['cb_val1'],'attrib interp working ' + i);
      assert.equal($('#descA-' + i%2).text(),tModel.form1[i]['cb_desc1'],'attrib description interp working ' + i);
    });
    
    $('.cbb:visible').each(function(i,el){
      assert.equal(el.getAttribute('value'),tModel.form1[i]['cb_val2'],'attrib interp working ' + i);
      assert.equal($('#descB-' + i%2).text(),tModel.form1[i]['cb_desc2'],'attrib description interp working ' + i);
    });
  });
  
});





