structureJS.module('Auth', function(require){
  var Templar = require('Templar'),
      AuthModel = Templar.getModel('Auth'),
      EnvModel = Templar.getModel('Env');
  
  /*For now, model manipulation function will be written as module.
    I may include them as part of the std API. I'm thinking along the lines
    of setter will be the tag names like 'model.select('modelAttribName', value)*/
  
  function select(model, selectName, value){
    var select = model.getSet(selectName),
        index = 0;
    for(var i = 0; i < select.length; i++){
      select[i].selected = false;
      if(select[i].value == value || select[i].text == value){
        index = i;
      }
    }
    select[index].selected = true;
    model.getSet(selectName, select);
    model.getSet('selected', value);
  }
  
  Templar.success('partial-login-screen.html', function(){
  
    console.log('partial-login-screen.html onload FIRED');
    
    AuthModel.listen('select', function(data){
      AuthModel.getSet('selected', data.text);
      console.log(AuthModel.getSet('selected'));
    });
    
    document.getElementById('btn-list1').addEventListener('click', function(){
      AuthModel.getSet('select', AuthModel.getSet('select1'));
      EnvModel.getSet('host', 'http://cnet.com');
    });
    
    document.getElementById('btn-list2').addEventListener('click',function(){
      AuthModel.getSet('select', AuthModel.getSet('select2'));
      EnvModel.getSet('host', 'http://google.com');
    });
    
    document.getElementById('btn-update-footer').addEventListener('click',function(){
      select(AuthModel, 'select', 'orig 1');
      EnvModel.getSet('footer', AuthModel.getSet('selected'));
      
    });
    
  });
  
  return {

  };
});