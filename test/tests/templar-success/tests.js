QUnit.asyncTest( 'Multiple onloads', function( assert ) {
  expect( 2 );
  var output = '';
  Templar.success('partial-login-screen.html', function(){
    output += 'onload1';
    QUnit.start();
  }); 
  
  Templar.success('partial-login-screen.html', function(){
  output += ' then onload2';
    assert.equal(output,'onload1 then onload2', 'multiple success callback fired in FIFO');
  }); 
});