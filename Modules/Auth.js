structureJS.module('Auth', function(require){
  var Templar = require('Templar'),
      AuthModel = Templar.getModel('Auth'),
      EnvModel = Templar.getModel('Env');
  
  /*For now, model manipulation function will be written as module.
    I may include them as part of the std API. I'm thinking along the lines
    of setter will be the tag names like 'model.select('modelAttribName', value)*/
  
  function select(model, selectName, value){
    var select = model[selectName],
        index = 0;
    for(var i = 0; i < select.length; i++){
      select[i].selected = false;
      if(select[i].value == value || select[i].text == value){
        index = i;
      }
    }
    select[index].selected = true;
    model.getSet[selectName] = select;
    model.selected = value;
  }
  
  Templar.success('partial-login-screen.html', function(){
    var states = AuthModel.states;
    console.log('partial-login-screen.html onload FIRED');
    
    AuthModel.listen('countries', function(data){
      
      AuthModel.selected = data.text;
      console.log(AuthModel.selected);
      switch(data.text){
        case 'CAN':
        /*This clobbers 'states', obviously undesirable.  */
          AuthModel.states = AuthModel.CAN_states;
         break;
        case 'US':
          AuthModel.states = states;
          /*
          AuthModel.stash('def_states', states)
          */
          break;
      }
      
    });
    
    /*
    document.getElementById('btn-list1').addEventListener('click', function(){
      console.log('click');
      EnvModel.getSet('host', 'http://cnet.com');
    });
    
    document.getElementById('btn-list2').addEventListener('click',function(){
      EnvModel.getSet('host', 'http://google.com');
    });
    
    document.getElementById('btn-update-footer').addEventListener('click',function(){
      select(AuthModel, 'countries', 'US');
      EnvModel.getSet('footer', AuthModel.getSet('selected'));
      
    });
    */
  });
  
  return {

  };
});