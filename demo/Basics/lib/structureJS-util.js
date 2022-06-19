structureJS.module('structureJS-util',function(require){
  var core = require('core');

  return {
    pLog : function(priority, msg, arrayOrObj){
      if(priority <= core.options.log_priority){
        console.log(msg);
        if(typeof arrayOrObj != 'undefined'){
          console.log(arrayOrObj);
        }
      }
    },
    /*NOTE: arguments is not of type array hence the wierd call to splice()*/
    printf : function(/*has arguments passed in via apply()*/){
      var returnVal = '';
      if(arguments.length > 1){
        var args = null;
        var result = '';
        var argIndex = 0;
        
        var formattedString = arguments[0];
        args = Array.prototype.slice.call(arguments, 0);
        args = args.splice(1, (arguments.length - 1));
        returnVal += formattedString.replace(/%s/g, function(match, matchOffset, fullString){
          if(argIndex < args.length){
            return args[argIndex++];
          }else{
            return '%s';
          }
        });
      } 

      return returnVal;
    },
    pLogf : function(){
      var returnVal = '';
      var _this = core;
      //priority = arguments[0];
      if(arguments.length >= 2 && arguments[0] <= this.options.log_priority){
        console.log(_this.printf.apply(null, Array.prototype.slice.call(arguments, 1)));
      }
    }
  
  };
  

});