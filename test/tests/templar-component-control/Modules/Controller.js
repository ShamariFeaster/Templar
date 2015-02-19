
Templar.success(function(){
var Templar = structureJS.require('Templar'),
    TestModel = Templar.getModel('test'),
    up = document.getElementById('attrib_up'),
    down = document.getElementById('attrib_down');

  up.addEventListener('click', function(){
    TestModel.dialogHeight++;
  });
  
  down.addEventListener('click', function(){
    TestModel.dialogHeight--;
  });
});    
