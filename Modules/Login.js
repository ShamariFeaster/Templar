structureJS.module('LoginCotroller', function(require){
  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');

  Templar.success('partial-login-screen.html', function(){
    
    /*Live filter stuff using input*/
    LoginModel.filter('countries').by('text').using('userInput');
    LoginModel.filter('list').using('userInput');
    
    /*Changes the 'States' select based on what country has been selected*/
    LoginModel.listen('countries', function(data){
      
      LoginModel.selected = data.text;

      switch(data.text){
        case 'CAN':
          LoginModel.update('US_states', LoginModel.CAN_states);
         break;
        case 'US':
          LoginModel.update('US_states', LoginModel.US_states);
          break;
        case 'MEX':
          LoginModel.update('US_states', LoginModel.MEX_states);
          break;
      }
      
    });
    
  });
  
  return {};
});