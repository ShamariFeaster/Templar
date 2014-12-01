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
      shuffleAll();
    },
    teardown : function(){
      aModel.limit('range').to(0);
    }
  });
  
  /*Helpers*/
  /*http://stackoverflow.com/questions/3718282/javascript-shuffling-objects-inside-an-object-randomize*/
  function fisherYatesShuffle(sourceArray) {
    for (var n = 0; n < sourceArray.length - 1; n++) {
        var k = n + Math.floor(Math.random() * (sourceArray.length - n));

        var temp = sourceArray[k];
        sourceArray[k] = sourceArray[n];
        sourceArray[n] = temp;
    }
  }
  
  function shuffleAll(){
    fisherYatesShuffle(aModel.range);
    aModel.update('range');
    fisherYatesShuffle(aModel.ns_numeric);
    aModel.update('ns_numeric');
    fisherYatesShuffle(aModel.ns_alpha);
    aModel.update('ns_alpha');
    fisherYatesShuffle(aModel.ns_mixed);
    aModel.update('ns_mixed');
  }
  function runPageTests(assert, actual, expected){
    _currentPage = aModel.currentPageOf('range');  
    _totalPages = aModel.totalPagesOf('range');
    var msg = (_.isDef(msg)) ? msg : '';
    assert.deepEqual(actual, expected, msg);
  }
  
  function setTotalAndCurrentPages(){
    _currentPage = aModel.currentPageOf('range');  
    _totalPages = aModel.totalPagesOf('range');
  }
  
  function getFullAttrib(modelName, attribName){
    return Templar.Map.getMap()[modelName].modelObj[attribName].slice(0);
  }
  
  function basicSort(a,b){
    return (a < b) ? -1 : (a==b) ? 0 : 1;
  }
  /*END Helpers*/
  
  //W/ No Limit Set
  QUnit.test('sort: unpaged',function( assert ){
    var copy = getFullAttrib('Attributes', 'range').slice(0).sort(basicSort);
    aModel.sort('range').orderBy();
    runPageTests(assert, aModel.range, copy, 'No limit set');
  });

  QUnit.test('sort: pages',function( assert ){
    var unsortedCopy = getFullAttrib('Attributes', 'range');
    aModel.limit('range').to(3);
    var sortedPage = getFullAttrib('Attributes', 'range').slice(0,3).sort(basicSort);
    aModel.sort('range').orderBy();
    aModel.limit('range').to(0);
    runPageTests(assert, aModel.range, sortedPage.concat(unsortedCopy.slice(3)), 'No limit set');
  });
  /*We cannot expect stability unless we sort all properties.
    
    Thoughts on this: if the client doesn't want the field to be sorted then it really doesn't matter
    what state that column is in at a given time. By sorting other fields, the client has declared
    those field's states superior to that of un-sorted fields.
  */
  QUnit.test('sort orderBy: unpaged',function( assert ){
    var solution = [
  {p1: 1 , p2 : 5, p3 : 4},
  {p1: 2 , p2 : 5, p3 : 5},
  {p1: 2 , p2 : 5, p3 : 6},
  {p1: 6 , p2 : 6, p3 : 2},
  {p1: 9 , p2 : 5, p3 : 7},
  {p1: 10, p2 : 7, p3 : 1},
  {p1: 14, p2 : 5, p3 : 3}];
    aModel.sort('ns_numeric').orderBy('p1').thenBy('p2').thenBy('p3');
    aModel.update('ns_numeric');
    runPageTests(assert, aModel.ns_numeric, solution, 'Correctly Sorted');
  });
  
  QUnit.test('sort orderBy: by clause permutation 1',function( assert ){
    var solution = [
  {p1: 10, p2 : 7, p3 : 1},
  {p1: 6 , p2 : 6, p3 : 2},
  {p1: 14, p2 : 5, p3 : 3},
  {p1: 1 , p2 : 5, p3 : 4},
  {p1: 2 , p2 : 5, p3 : 5},
  {p1: 2 , p2 : 5, p3 : 6},
  {p1: 9 , p2 : 5, p3 : 7}
  
  ];
    aModel.sort('ns_numeric').orderBy('p3').thenBy('p2').thenBy('p1');
    aModel.update('ns_numeric');
    runPageTests(assert, aModel.ns_numeric, solution, 'Correctly Sorted');
  });
  
  QUnit.test('sort orderBy: by clause permutation 2',function( assert ){
    var solution = [
  {p1: 1 , p2 : 5, p3 : 4},
  {p1: 2 , p2 : 5, p3 : 5},
  {p1: 2 , p2 : 5, p3 : 6},
  {p1: 9 , p2 : 5, p3 : 7},
  {p1: 14, p2 : 5, p3 : 3},
  {p1: 6 , p2 : 6, p3 : 2},
  {p1: 10, p2 : 7, p3 : 1},
  
  ];
    aModel.sort('ns_numeric').orderBy('p2').thenBy('p1').thenBy('p3');
    aModel.update('ns_numeric');
    runPageTests(assert, aModel.ns_numeric, solution, 'Correctly Sorted');
  });
  
  QUnit.test('sort orderBy: duplicate by clauses',function( assert ){
    var solution = [
  {p1: 10, p2 : 7, p3 : 1},
  {p1: 6 , p2 : 6, p3 : 2},
  {p1: 14, p2 : 5, p3 : 3},
  {p1: 1 , p2 : 5, p3 : 4},
  {p1: 2 , p2 : 5, p3 : 5},
  {p1: 2 , p2 : 5, p3 : 6},
  {p1: 9 , p2 : 5, p3 : 7}
  
  ];
    aModel.sort('ns_numeric').orderBy('p3').thenBy('p3').thenBy('p3');
    aModel.update('ns_numeric');
    runPageTests(assert, aModel.ns_numeric, solution, 'Correctly Sorted');
  });
  

  
  QUnit.test('sort orderBy thenBy 2: alpha',function( assert ){
    var solution = [
  {p1: 'a', p2: 'b', p3: 'b'},
  {p1: 'b', p2: 'b', p3: 'a'},
  {p1: 'c', p2: 'a', p3: 'b'},
  {p1: 'c', p2: 'b', p3: 'b'},
  {p1: 'c', p2: 'b', p3: 'c'},
  {p1: 'c', p2: 't', p3: 'b'},
  {p1: 'c', p2: 'z', p3: 'b'},
  ];
    aModel.sort('ns_alpha').orderBy('p1').thenBy('p2').thenBy('p3');
    aModel.update('ns_alpha');
    runPageTests(assert, aModel.ns_alpha, solution, 'Correctly Sorted');
  });
  /*Fails because character comparisons are done by the ascii int val of the character.
  
    Other short comings:
      1. dealing case
  
  QUnit.test('sort orderBy thenBy 2: mixed',function( assert ){
    var solution = [
  {p1: 'a', p2: '1', p3: 26},
  {p1: 'b', p2: '1', p3: 33},
  {p1: 'c', p2: '1', p3: 13},
  {p1: 'c', p2: '1', p3: 20},
  {p1: 'c', p2: 'a', p3: 'b'},
  {p1: 'c', p2: 't', p3: 'b'},
  {p1: 'c', p2: 'z', p3: 'b'}];
    aModel.sort('ns_mixed').orderBy('p1').thenBy('p2').thenBy('p3');
    aModel.update('ns_mixed');
    runPageTests(assert, aModel.ns_mixed, solution, 'Correctly Sorted');
  });
  */
});






