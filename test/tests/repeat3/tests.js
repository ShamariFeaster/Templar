QUnit.module('Dependency Functional Tests', 
{
  setup : function(){
    console.log('setup');
  },
  teardown : function(){
    console.log('teardown');
  }
});

QUnit.test('templar.test 3',function( assert ){
  assert.equal(true, true , "Dummy Assertion");
  assert.equal(false, true , "Dummy Assertion");
});