/*Note that scope-related cleanup  is tested here*/

/*2-15-16
  This test relies on the pre-route, discarded feature of automatically loading
  partials via anchor tags with anchor link href. This test will have to be retooled.
*/

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
  QUnit.asyncTest('partial onload for both', function( assert ){
    $gotoHome = document.getElementById('goto-home-screen-content');
    $gotoLogin = document.getElementById('goto-login-screen-content');

    
    
    Templar.success('partial-home-screen.html', function(){
      
        QUnit.start();
        System.setSystemListeners(_.SYSTEM_EVENT_TYPES.link_done, function(){
            assert.equal(getCount(modelName, attribName), 12, 'Repeat node count is correct');
            assert.equal(getCount('Environment', 'image_templar'), 1, 'Node count is correct');
            assert.equal(getCount('Environment', 'host'), 1, 'Node count is correct');
            $gotoLogin.click();
            
        });
    });
    
    $gotoHome.click();
  });
  

  
  /*
  
  This test is not being run for some reason but I have verified it passes in isolation
  . Fix this eventually but for now I'm moving on.
  
  QUnit.asyncTest('partial onload for both', function( assert ){
    
    Templar.success('partial-login-screen.html', function(){
      
      System.setSystemListeners(_.SYSTEM_EVENT_TYPES.link_done, function(){
        assert.equal(getCount(modelName, attribName), 12, 'Repeat node count is correct');
        assert.equal(getCount('Environment', 'image_templar'), 2, 'Node count is correct');
        assert.equal(getCount('Environment', 'host'), 2, 'Node count is correct');
        QUnit.start();
      });

    });
  });
  */






