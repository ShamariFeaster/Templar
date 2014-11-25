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
      $div = null, _currentPage = 0, _totalPages = 0;
  QUnit.config.reorder = false;
  QUnit.module('Paging: NOTE: getters are tested with paging implicitly in tests', 
  {
    setup : function(){
      aModel = Templar.getModel('Attributes');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      DOM = structureJS.require('DOM');
      _ = structureJS.config.context;
      //aModel.limit('range').to(3);
    },
    teardown : function(){
      aModel.limit('range').to(0);
    }
  });
  
  /*Helpers*/

  function runPageTests(assert, actLength, expLength, expCurrPg, expTotalPg, msg){
    _currentPage = aModel.currentPageOf('range');  
    _totalPages = aModel.totalPagesOf('range');
    var msg = (_.isDef(msg)) ? msg : '';
    assert.equal(actLength, expLength, 'paging length correct.' + msg );
    assert.equal(_currentPage, expCurrPg, 'currentPage initialized correctly.' + msg);
    assert.equal(_totalPages, expTotalPg, 'totalPages initialized correctly. ' + msg);
  }
  
  function setTotalAndCurrentPages(){
    _currentPage = aModel.currentPageOf('range');  
    _totalPages = aModel.totalPagesOf('range');
  }
  
  /*END Helpers*/
  
  //W/ No Limit Set
  QUnit.test('Limit',function( assert ){
    $div = $('.paged-asset');
    /*minus 1 for the hidden base node*/
    runPageTests(assert, aModel.range.length, $div.length - 1, 0, 0, 'No limit set');
  });
  
  QUnit.test('gotoPage: Out of range',function( assert ){
    $div = $('.paged-asset');
    /*minus 1 for the hidden base node*/
    aModel.gotoPage(20).of('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 0, 0, 'No limit set');
  });
  
  QUnit.test('gotoNextPageOf',function( assert ){
    $div = $('.paged-asset');
    aModel.gotoNextPageOf('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 0, 0, 'No limit set');
  });
  
  QUnit.test('gotoPreviousPageOf',function( assert ){ 
    $div = $('.paged-asset');
    aModel.gotoPreviousPageOf('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 0, 0, 'No limit set');
  });
  
  //W/ Limit Set
  QUnit.test('Limit',function( assert ){
    aModel.limit('range').to(3);
    $div = $('.paged-asset');
    runPageTests(assert, aModel.range.length, $div.length - 1, 1, 5, 'Limit set');
  });
  
  QUnit.test('gotoPage',function( assert ){
    $div = $('.paged-asset');
    aModel.limit('range').to(3);
    aModel.gotoPage(3).of('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 3, 5, 'Limit set');
    aModel.gotoPage(23).of('range');
    assert.equal(_currentPage, 3, 'currentPage: out of range');
    assert.equal(_totalPages, 5, 'totalPages: out of range ');
  });
  
  
  QUnit.test('gotoNextPageOf',function( assert ){
    aModel.limit('range').to(3);
    $div = $('.paged-asset');
    aModel.gotoNextPageOf('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 2, 5, 'Limit set');
  });
  
  QUnit.test('gotoPreviousPageOf',function( assert ){ 
    aModel.limit('range').to(3);
    $div = $('.paged-asset');
    aModel.gotoPreviousPageOf('range');
    runPageTests(assert, aModel.range.length, $div.length - 1, 1, 5, 'Limit set');
  });
  /**/
  
  QUnit.test('Valid limit Then Invalid limit',function( assert ){
    $div = $('.paged-asset');
    aModel.limit('range').to(3);
    aModel.limit('range').to(-100);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 0, 'currentPage: negative limit set');
    assert.equal(_totalPages, 0, 'totalPages: negative limit set');
    
    aModel.limit('range').to(3);
    aModel.limit('range').to(0);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 0, 'currentPage: null limit set');
    assert.equal(_totalPages, 0, 'totalPages: null limit set');
  });
  
  QUnit.test('gotoNext/PrevPageOf Out of bounds',function( assert ){
    $div = $('.paged-asset');
    aModel.limit('range').to(3);
    setTotalAndCurrentPages();
    for(var i = 0; i < _totalPages * 2; i++){
      aModel.gotoPreviousPageOf('range');
    }
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: down out of range');
    assert.equal(_totalPages, 5, 'totalPages: down out of range ');
    
    for(var i = 0; i < _totalPages * 2; i++){
      aModel.gotoNextPageOf('range');
    }
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 5, 'currentPage: up out of range');
    assert.equal(_totalPages, 5, 'totalPages: up out of range ');
  });
  
  QUnit.test('Paging',function( assert ){
    $div = $('.paged-asset');
    aModel.limit('range').to(3);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: under attrib size limit set');
    assert.equal(_totalPages, 5, 'totalPages: under attrib size limit set');
    
    aModel.limit('range').to(1);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: under attrib size limit set');
    assert.equal(_totalPages, 14, 'totalPages: under attrib size limit set');
    
    aModel.limit('range').to(5);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: under attrib size limit set');
    assert.equal(_totalPages, 3, 'totalPages: under attrib size limit set');
    
    aModel.limit('range').to(12);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: under attrib size limit set');
    assert.equal(_totalPages, 2, 'totalPages: under attrib size limit set');
    
    aModel.limit('range').to(14);
    setTotalAndCurrentPages();
    assert.equal(_currentPage, 1, 'currentPage: over attrib size  limit set');
    assert.equal(_totalPages, 1, 'totalPages: over attrib size  limit set');
  });
  
});






