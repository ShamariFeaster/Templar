structureJS.module({name : 'queueOnload', 
                    description : 'attach other module functions to window onload event'
                    }, 
function(require){
  var _functions = [];
  
  /*FIFO function execution*/
  function executeQueue(){
    var funcObj = null;
    for(var i = 0; i < _functions.length; i++){
      funcObj = _functions[i];
      funcObj['func'].apply(null, funcObj['args'] );
    }
  };
  /*bind function to onload event*/
  /*FIX:rather than clober onload, I should see if something was there before and add it to the Queue*/
  window.onload = executeQueue;
  
  return {
  
    bind : function(func, args){
      var funcObj = {};
      var args = args || [];
      var func = func || function(){};
      funcObj.func = func;
      funcObj.args = args;
      _functions.push(funcObj);
    }
    
  };
});