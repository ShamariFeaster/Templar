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

    AuthModel.filter('countries').by('text').using('userName');
    AuthModel.filter('list').using('userName');
    
    AuthModel.listen('countries', function(data){
      
      AuthModel.selected = data.text;

      switch(data.text){
        case 'CAN':
        /*This clobbers 'states', obviously undesirable.  */
          AuthModel.update('states', AuthModel.CAN_states);
         break;
         
        case 'US':
          AuthModel.update('states', AuthModel.states);

          break;
      }
      
    });
    
    /*
    
    AuthModel.filter('countries').using('seachInput');
    AuthModel.filter('people').by('firstName').using('userInput');
    
    AuthModel.sort('countries').using('userDefinedSort');
    AuthModel.sort('countries').by('lastName').using('userDefinedSort');
    
    AuthModel.forEach('people', function(person){
    
    });
    
    Templar('button1').listen('onclick', function(){
      //Behind the scenes, control listeners look like this
      function wrapper(e){
        e.specialData = 'stuff';
        passedinFunction.call(null, e);
      }
      buttonNode.addEventListener('onclick', wrapper);
    
    });
    
    Templar('startVideo').show()
    Templar('startVideo').hide()
    Templar('startVideo').addClass()
    Templar('startVideo').removeClass()
    Templar('startVideo').hasClass()
    Templar('startVideo').hidden() 
    Templar('startVideo').listen('onclick',function(){})
    Templar('startVideo').ignore('onclick')
    
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