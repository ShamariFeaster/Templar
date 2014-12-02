QUnit.frameworkLoaded(function(){
  var cModel = Templar.getModel('Comments'),
      _ = structureJS.config.context;
  QUnit.module('Templar', 
  {
    setup : function(){
    },
    teardown : function(){
      cModel.unlisten('range');
    }
  });
  
  QUnit.asyncTest('mode listener: single bind, testing get/set interping',function( assert ){
    var cnt = 0,
        newRangeVal = [50,51,52,53,54];
        
    
    cModel.listen('range', function(e){
      if(++cnt == 1){
        QUnit.start();
        $items = $('.range-item span');
        assert.deepEqual(newRangeVal, e.value, 'Update to attrib fired listener');
        $items.each(function(i){
          if(i == 0) return; /*skip repeat base node*/
          assert.equal(cModel.range[i],this.innerHTML, 'interpolation for item ' + i + ' worked');
        });
      }
    });
    
    cModel.range = newRangeVal;
    
  });
  
  QUnit.asyncTest('mode listener: double bind, testing get/set interping',function( assert ){
    var cnt = 1,
        newRangeVal = [50,51,52,53,54];
        
    var handler = function(e){
      if(cnt == 1){
        QUnit.start();
        $items = $('.range-item span');
        assert.deepEqual(newRangeVal, e.value, 'Update to attrib fired listener');
        $items.each(function(i){
          if(i == 0) return; /*skip repeat base node*/
          assert.equal(cModel.range[i],this.innerHTML, 'interpolation for item ' + i + ' worked');
        });
        
      }
      
      if(cnt == 2){
        assert.ok(false, 'Failed because allowed double binding of same handler');
      }
      
      cnt++;
      
    };
    cModel.listen('range', handler);
    cModel.listen('range', handler);
    
    cModel.range = newRangeVal;
    
  });
});