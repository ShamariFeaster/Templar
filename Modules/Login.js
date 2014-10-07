structureJS.module('Auth', function(require){
  var Templar = require('Templar'),
      AuthModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');

  Templar.success('partial-login-screen.html', function(){
    
    /*Live filter stuff using input*/
    AuthModel.filter('countries').by('text').using('userInput');
    AuthModel.filter('list').using('userInput');
    
    /*Changes the 'States' select based on what country has been selected*/
    AuthModel.listen('countries', function(data){
      
      AuthModel.selected = data.text;

      switch(data.text){
        case 'CAN':
          AuthModel.update('US_states', AuthModel.CAN_states);
         break;
         
        case 'US':
          AuthModel.update('US_states', AuthModel.US_states);

          break;
      }
      
    });
    
  });
  
  return {};
});