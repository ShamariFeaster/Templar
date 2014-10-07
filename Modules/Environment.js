structureJS.module('Auth', function(require){
  var Templar = require('Templar'),
      EnvModel = Templar.getModel('Environment');
      var dateObj = new Date();
      
      /*Set inital time*/
      EnvModel.time = dateObj.toDateString() + ' ' + dateObj.toTimeString();
      
      /*Incremenet clock every second*/
      setInterval(function(){
        dateObj.setSeconds(dateObj.getSeconds() + 1);
        EnvModel.time = dateObj.toDateString() + ' ' + dateObj.toTimeString();
      },1000);
      
  
  return {};
});