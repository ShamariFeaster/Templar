QUnit.frameworkLoaded(function(){
  var ControlNode, Map, System, _, tcn1, tcn2;
  QUnit.module('Templar', 
  {
    setup : function(){
      ControlNode = structureJS.require('ControlNodeHeader');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      _ = structureJS.config.context;
      tcn1 = Templar('testCn1');
      tcn2 = Templar('testCn2');
    },
    teardown : function(){

    }
  });

  QUnit.test('ControlNode internals',function( assert ){
    var controlNode = new ControlNode(null,'test');
    Map.addControlNode(controlNode);
    var cn = Templar('test');
    assert.equal(cn instanceof ControlNode,true,'Templar ControlNode retreival working');
    assert.equal(cn.controlBaseNodes.length == 1,true,'Templar basenode');
    assert.equal(cn.controlBaseNodes[0].id,'test','Templar id');
  });

  QUnit.test('ControlNode created in static html content',function( assert ){
    assert.equal(tcn1 instanceof ControlNode,true,'tcn1 is ControlNode');
    assert.equal(tcn1.controlBaseNodes.length == 1,true,'Templar basenode');
  });

  QUnit.test('ControlNode created in partial (dynamic loaded)',function( assert ){
    assert.equal(tcn2 instanceof ControlNode,true,'tcn2 is ControlNode');
    assert.equal(tcn2.controlBaseNodes.length == 1,true,'Templar basenode');

  });
  
  QUnit.test('ControlNode API',function( assert ){
    var btn1 = tcn1.controlBaseNodes[0].childIds.testCnBtn1;
    btn1.hide();
    assert.equal($('#testCnBtn1').is(':visible'),false,'hide() works');
    btn1.show();
    assert.equal($('#testCnBtn1').is(':visible'),true,'show() works');
  });
  
});






