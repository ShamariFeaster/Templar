
Templar.success(function(){
var Templar = structureJS.require('Templar'),
    TestModel = Templar.getModel('test');

  var changeSizeCtrl = Templar('changeSize');
  
  changeSizeCtrl.listenTo('up').forEvent('click', function(e){
    console.log(e);
    TestModel.dialogHeight++;
  });

  changeSizeCtrl.listenTo('down').forEvent('click', function(e){
    console.log(e);
    TestModel.dialogHeight--;
  });

});    
