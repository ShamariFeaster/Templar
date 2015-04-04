structureJS.module('TitleDescriptionController', function(require){

var _Templar = Templar,
    Controller = require('Controller')();
  
_Templar.success("#/new-ad/2", function(){
  Controller.init('Title & Description');
});

});