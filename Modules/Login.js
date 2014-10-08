structureJS.module('LoginCotroller', function(require){
  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');
    
  /*Limit any sequential data attrib, like those backing repeats*/
  LoginModel.limit('list').to(5);
  
  /*static filter*/
  /*
    LoginModel.filter('numbers')
    .using(function(a){ return (a > 2);})
    .and(function(a){ return (a < 5);});
    
    LoginModel.filter('items')
    .by('price')
    .using(function(price){return parseInt(price) > 15});
    
    LoginModel.filter('items')
    .by('title')
    .using(function(title){return title.indexOf('P') != -1});
    
    //Live filter by property
    LoginModel.filter('countries').by('text').using('userInput');
    
    //Live filtera
    LoginModel.filter('list').using('userInput');
      
    LoginModel.filter('items')
    .by('title')
    .using('userInput');
  
   */ 
    
  
  
  
  Templar.success('partial-login-screen.html', function(){
    
    
      
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