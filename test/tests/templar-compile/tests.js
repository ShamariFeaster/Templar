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