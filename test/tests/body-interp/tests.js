QUnit.module('Dependency Functional Tests', 
{
  setup : function(){
  },
  teardown : function(){

  }
});

QUnit.test('templar.interpolation',function( assert ){
  assert.equal($('#footer').text(),Templar.getModel('Environment').footer,'Footer interp correct');
});