QUnit.asyncTest( 'Multiple onloads', function( assert ) {
  expect( 2 );
 
  Templar.success('partial-login-screen.html', function(){
    assert.ok(true,'onload1');
    QUnit.start();
  }); 
  
  Templar.success('partial-login-screen.html', function(){
    assert.ok(true,'onload2');
  }); 
});