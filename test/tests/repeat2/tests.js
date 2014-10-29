QUnit.module('Dependency Functional Tests', 
{
  setup : function(){
    console.log('setup');
  },
  teardown : function(){
    console.log('teardown');
  }
});

QUnit.test('templar.test 2',function( assert ){
  assert.equal(true, true , "Dummy Assertion");
});