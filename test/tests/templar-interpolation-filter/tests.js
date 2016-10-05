QUnit.frameworkLoaded(function(){
  /*not sure why I was doing this in setup? amateur hour shit for sure. what can I say
   I'm a little burnt.*/
  var cModel = Templar.getModel('Comments'), 
      Map = structureJS.require('Map'), 
      System = structureJS.require('System'), 
      DOM = structureJS.require('DOM'), 
      _ = structureJS.state.context, 
      preFilterLength = cModel.comments.length,
      range3PreFilterLength = cModel.range3.length,
      dispatchCnt = 0,
      $input = $('#input');
      
  QUnit.module('Input Elements', 
  {
    setup : function(){

    },
    teardown : function(){
      cModel.unlisten('comments');
      cModel.resetLiveFiltersOf('comments');
      cModel.unlisten('range');
      cModel.resetLiveFiltersOf('range');
      cModel.resetStaticFiltersOf('range2');
      dispatchCnt = 0;
      while($('#input').val() != ''){
        $input.sendkeys('{backspace}');
      }
    }
  });
  
  function getCount(selector){
    return $(selector).length - 1;
  }
  
  /*Helpers*/

  /*END Helpers*/
  /*
  Using https://github.com/dwachss/bililiteRange
          http://bililite.com/blog/
  */
  
 
  QUnit.asyncTest('No match',function( assert ){
     QUnit.stop();
     
    cModel.listen('comments', function(e){
      assert.equal(cModel.comments.length, preFilterLength, 'Filtration working');
      QUnit.start(2);
    });
    
    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('z');

  });
  
  //attib.length always returns prefiltered length.
  QUnit.asyncTest('Match found',function( assert ){
    
    cModel.listen('comments', function(e){
      assert.equal(getCount('.comments-fn'), 2, 'Filtration working');
      QUnit.start();
    })
    
    
    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('s');
    
    
    
        
    
    
  });
  
  QUnit.asyncTest('Match found, next input produces non-mtach',function( assert ){
    
    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('s');
    $input.sendkeys('y');
    //$input.sendkeys('{backspace}');
    
    
    
        
    cModel.listen('comments', function(e){
      dispatchCnt++;
      if(dispatchCnt == 2){
        assert.equal($input.val(), 'sy', 'Input is "sy"');
        assert.equal(getCount('.comments-fn'), preFilterLength, 'Filtration working');
        QUnit.start();
      }
      
    })
    
  });
  
  QUnit.asyncTest('Match found, next input produces non-mtach, then backspace to match',function( assert ){

    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('s');
    $input.sendkeys('y');
    $input.sendkeys('{backspace}');
    //$input.sendkeys('{backspace}');
    
    
    
        
    cModel.listen('comments', function(e){
      dispatchCnt++;
      if(dispatchCnt == 2){
        assert.equal($input.val(), 's', 'Input is "s"');
        assert.equal(getCount('.comments-fn'), 2, 'Filtration working');
        QUnit.start();
      }
      
    })
    
  });
  
  QUnit.asyncTest('Match found,switch search property, then no match',function( assert ){

    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('s');   
        
    cModel.listen('comments', function(e){
      
      if(++dispatchCnt == 1){
        
        assert.equal($input.val(), 's', 'Input is "s"');
        assert.equal(getCount('.comments-fn'), 2, 'Filtration working');
        
        cModel
          .filter('comments')
          .by('ln')
          .using('searchInput');
        
        $input.sendkeys('{backspace}');
        QUnit.start();
      }
      
      if(dispatchCnt == 2){
        assert.equal($input.val(), '', 'Input is ""');
        assert.equal(getCount('.comments-fn'), preFilterLength, 'Filtration working');
      }
      
    })
    
  });
  
  QUnit.asyncTest('Match found,switch search property, then  match',function( assert ){

    cModel
        .filter('comments')
        .by('fn')
        .using('searchInput');
        
    $input.sendkeys('s');   
        
    cModel.listen('comments', function(e){

      if(++dispatchCnt == 1){
        assert.equal($input.val(), 's', 'Input is "s"');
        assert.equal(getCount('.comments-fn'), 2, 'Filtration working');
        
        cModel
          .filter('comments')
          .by('ln')
          .using('searchInput');
        
        $input.sendkeys('{backspace}');
        $input.sendkeys('b');
        QUnit.start();
      }
      
      if(dispatchCnt == 3){
        assert.equal($input.val(), 'b', 'Input is "b"');
        assert.equal(getCount('.comments-fn'), 2, 'Filtration working');
      }
      
    })
    
  });
  
  QUnit.asyncTest('Using scalar array, Match found (no by clause)',function( assert ){
    dispatchCnt = 0;
    cModel
        .filter('range')
        .using('searchInput');
        
    $input.sendkeys('1');
    $input.sendkeys('0');
    //$input.sendkeys('{backspace}');
    
    cModel.listen('range', function(e){

      if(++dispatchCnt == 2){
        assert.equal($input.val(), '10', 'Input is "10"');
        assert.equal(getCount('.range1'), 1, 'Filtration working');
        QUnit.start();
      }
      
    })
    
  });
  
  QUnit.test('Static filter using scalar array, Match found ',function( assert ){
    cModel
        .filter('range2')
        .using(function(a){ return a > 5;});

    cModel.update('range2');
    assert.equal(getCount('.range2'), 5, 'Static Filtration working');
    
  });
  
  QUnit.test('Static filter using scalar array, Match found, multiple filters',function( assert ){
    cModel
        .filter('range2')
        .using(function(a){ return a > 5;})
        .and(function(a){ return a < 7;});

    cModel.update('range2');
    assert.equal(getCount('.range2'), 1, 'Static Filtration working');
  });
  
  QUnit.test('Static filter using non-scalar array, Match found, multiple filters',function( assert ){
    cModel
      .filter('comments2')
      .using(function(comment){ return parseInt(comment.id) > 7;})
      .and(function(comment){ return comment.ln.charAt(0) == ('m');});

        assert.equal(getCount('.comments2-item'), 2, 'Static Filtration working');
  });
  
  QUnit.asyncTest('Using scalar array, 2 live filter overrides. ',function( assert ){

    //ISSUE: if default filter is overridden by a contratiction, listeners are never fired
    cModel
      .filter('range3')
      .using('searchInput')
      .and(function(liveInput, el){ 
            var el = el.toString();       //default filter override
            return (el.charAt(el.length-1) == liveInput.charAt(liveInput.length-1));
      })
      .and(function(liveInput){ return (liveInput.length > 1);});//input filter
        
    $input.sendkeys('1');
    $input.sendkeys('0');
    
    cModel.listen('range3', function(e){

      if(++dispatchCnt == 1){
        assert.equal($input.val(), '10', 'Input is "10". Listener didn\'t fire until input filter passed');
        assert.equal(getCount('.range3'), 2, 'Default switched to endsWith');
        QUnit.start();
      }

      
    })
    
  });
/*  */
});






