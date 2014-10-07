structureJS.module('LoginCotroller', function(require){
  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');
    
  LoginModel.limit('list').to(5);
  
  Templar.success('partial-login-screen.html', function(){
    
    /*Live filter stuff using input*/
    //LoginModel.filter('countries').by('text').using('userInput');
    LoginModel.filter('list').using('userInput');
    
    /*
    LoginModel.gotoPage(2).of('list');
    */
    
    
    
    /*Changes the 'States' select based on what country has been selected*/
    LoginModel.listen('countries', function(e){
      
      LoginModel.selected = e.text;

      switch(e.text){
        case 'CAN':
          LoginModel.softset('US_states', LoginModel.CAN_states);
          LoginModel.gotoPage(1).of('list');
         break;
        case 'US':
          LoginModel.softset('US_states', LoginModel.US_states);
          LoginModel.gotoPage(3).of('list');
          break;
        case 'MEX':
          LoginModel.softset('US_states', LoginModel.MEX_states);
          LoginModel.gotoPage(2).of('list');
          break;
      }

    });
    
  });
  
  return {};
});