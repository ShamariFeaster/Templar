/*
I learned that even though structureJS will synchronize when scripts are loaded, this is not enough
to guarantee that everything is truly synchronous. This is especially true of script that have 
asynchronous operation like Templar (fetching partials). window.onload will also not wait for 
asynchronous operation to complete before firing, making it and structureJS unreliable for e2e testing
of Templar features such as Controls in partials. structureJS is making sure my test script comes last, 
but if my test attempts to make use of a Control inside of a partial, the test may execute before that 
partial's DOM is mature. To counteract this, I extended Qunit to allow placement of tests into the
interpolation_done system event. The interface for this is called QUnit.frameworkLoaded()

*/

QUnit.frameworkLoaded(function(){
  var ControlNode, Map, System, DOM, _, baseNode, btnCtrl, btn1;
  QUnit.module('Templar', 
  {
    setup : function(){
      ControlNode = structureJS.require('ControlNodeHeader');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      DOM = structureJS.require('DOM');
      _ = structureJS.config.context;
      baseNode = Templar('testCn1');
      btnCtrl = Templar('btnCtrl');
      /*get ControlNode-wrapped element*/
      btn1 = baseNode.controlBaseNodes[0].childIds.testCnBtn1;
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

  QUnit.test('ControlNode created in static and dynamic html content',function( assert ){
    assert.equal(baseNode instanceof ControlNode,true,'baseNode is ControlNode');
    assert.equal(baseNode.controlBaseNodes.length == 3,true,'Templar basenode');
  });

  
  QUnit.test('ControlNode API show/hide (and by extension add/removeClass)',function( assert ){
    baseNode.hide();
    var condition = ($('button[name=tcn1]').is(':visible') ||
                     $('button[name=tcn2]').is(':visible') ||
                     $('button[name=tcn3]').is(':visible'))
    assert.equal(condition,false,'hide() works and by extension un-indexed indexedWrapper');
    baseNode.show();
    condition = ($('button[name=tcn1]').is(':visible') &&
                 $('button[name=tcn2]').is(':visible') &&
                 $('button[name=tcn3]').is(':visible'))
    assert.equal(condition,true,'show() works and by extension un-indexed indexedWrapper');
    
  });
  
  QUnit.test('ControlNode API indexed hide/show',function( assert ){
    baseNode.hide(0);
    var condition = $('button[name=tcn1]').is(':visible');
    assert.equal(condition,false,'indexed hide() and by extension indexedWrapper works');
    
    baseNode.show(0);
    condition = $('button[name=tcn1]').is(':visible');
    assert.equal(condition,true,'indexed show() works');
  });
  
  QUnit.test('ControlNode API listenTo',function( assert ){
    var clicked = false;
    baseNode.listenTo('testCnBtn1').forEvent('click', function(){
      clicked = true;
    });
    
    $('button[name=tcn1]').click();
    assert.equal(clicked,true,'listenTo() works (btn1)');
    
    clicked = false;
    $('button[name=tcn2]').click();
    assert.equal(clicked,true,'listenTo() works (btn1)');
    
    clicked = false;
    $('button[name=tcn3]').click();
    assert.equal(clicked,true,'listenTo() works (btn1)');
  });
  
  QUnit.test('ControlNode API listen',function( assert ){
    var clicked = false;
    btnCtrl.listen('click', function(){
      clicked = true;
    });
    
    $('#btnCtrl').click();
    assert.equal(clicked,true,'listen() works (btn1)');

  });
  
  QUnit.test('ControlNode API forEach',function( assert ){
    var cnt = 0, childCnt = 0;;
    baseNode.forEach( function(i, thisBaseNode, children){
      cnt += i;
      childCnt += Object.keys(children).length;
    });
    
    assert.equal(cnt,3,'forEach() works (index count)');
    assert.equal(childCnt,3,'forEach() works (childId count)');
  });
  
});






