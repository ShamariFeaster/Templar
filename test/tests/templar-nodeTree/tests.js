/*Note that scope-related cleanup  is tested here*/

QUnit.frameworkLoaded(function(){
  var ControlNode, Map, System, DOM, _, nodeTree, controlTree, $gotoHome, $gotoLogin, getCount,
      modelName = 'Comments', attribName = 'range';
  QUnit.module('Templar', 
  {
    setup : function(){
      ControlNode = structureJS.require('ControlNodeHeader');
      Map = structureJS.require('Map');
      System = structureJS.require('System');
      DOM = structureJS.require('DOM');
      _ = structureJS.config.context;
      nodeTree = Map.getMap();
      controlTree = Map.getControls();
      
      getCount = function(modelName, attribName){
        var cnt = 0;
        Map.forEach(modelName, attribName, function(){
          cnt++;
        });
        return cnt;
      };
    },
    teardown : function(){

    }
  });
  
  $gotoHome = document.getElementById('goto-home-screen-content');
  $gotoLogin = document.getElementById('goto-login-screen-content');

  QUnit.test('Node Tree internals onload (initial)',function( assert ){
    assert.equal(getCount(modelName, attribName), 11, 'Repeat node count is correct');
    assert.equal(getCount('Environment', 'image_templar'), 1, 'Repeat node count is correct');
    assert.equal(getCount('Environment', 'host'), 1, 'Repeat node count is correct');
    $gotoHome.click();
  });
  
  
  QUnit.asyncTest('partial onload for both', function( assert ){
    Templar.success('partial-home-screen.html', function(){
      /*
      Explanation of Bahviors:
      
      If I get a count in success() I will get a count with a base node that was added
      during compile step, which adds the single base node. During interpolate, this base
      node is, along with the rest of the tree, is detroyed during teardown so it makes
      sense to do the count after the rebuild.

      When using only repeats in the injected partial, I cannot test pruning because
      the cleanup is being done during the tear down of the existing repeat in 
      Interpolate.interpolate.
      
      Counts for Environment.image_templar and Environment.host will read 1 initially and
      2 subsequently. This is b/c pruning happens under the following conditions:
        1. node has scope == to new scope
        2. node scope time is older the  the current time
        
      So scope A loads first, it's nodes get put on tree. Scope B now loads, but does not remove
      any nodes. The count should read 2 (scope A & B's nodes are both on tree). Scope A is loaded.
      Now its nodes from the last load are removed BUT its nodes from this load are added so the
      count will still read 2. And so on and so on.....
      */
      System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, function(){
          assert.equal(getCount(modelName, attribName), 11, 'Repeat node count is correct');
          assert.equal(getCount('Environment', 'image_templar'), 2, 'Node count is correct');
          assert.equal(getCount('Environment', 'host'), 2, 'Node count is correct');
          $gotoLogin.click();
          QUnit.start();
      });

    });
    
    
  });
  QUnit.asyncTest('partial onload for both', function( assert ){
    Templar.success('partial-login-screen.html', function(){
      System.setSystemListeners(_.SYSTEM_EVENT_TYPES.interpolation_done, function(){
        assert.equal(getCount(modelName, attribName), 11, 'Repeat node count is correct');
        assert.equal(getCount('Environment', 'image_templar'), 2, 'Node count is correct');
        assert.equal(getCount('Environment', 'host'), 2, 'Node count is correct');
        QUnit.start();
      });

    });
  });
  
});






