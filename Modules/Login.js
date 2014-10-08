structureJS.module('LoginCotroller', function(require){
  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');
    
  /*Limit any sequential data attrib, like those backing repeats*/
  LoginModel.limit('list').to(5);
  
  /*static filter*/
  /*
    //multi condition static search (PASSED)
    LoginModel.filter('numbers')
    .using(function(a){ return (a > 2);})
    .and(function(a){ return (a < 5);});
    
    //Live filter after static filter (PASSED)
    LoginModel.filter('numbers')
    .using('userInput');
    
    //single prop static search
    LoginModel.filter('items')
    .by('price')
    .using(function(price){return parseInt(price) > 15});
    
    //multi prop static search
    LoginModel.filter('items')
    .using(function(item){return parseInt(item.price) > 15})
    .and(function(item){ return title.indexOf('P') != -1;});
    
    LoginModel.filter('items')
    .by('title')
    .using(function(title){return title.indexOf('P') != -1};);
    
    //Live filter by property
    LoginModel.filter('countries')
    .by('text')
    .using('userInput');
    
    //Live filter with condition, possible but not very useful as the live search would be 
    //startsWith. Would be useful if condition could act on different prop but honestly this is
    //easier to attain by a static filter before setting the live filter.
    LoginModel.filter('countries')
    .by('text')
    .using('userInput')
    .and(function(text){});
    
    //Live filtera
    LoginModel.filter('list').using('userInput');
      
    LoginModel.filter('items')
    .by('title')
    .using('userInput');
  
    //next up, then sorting
    LoginModel.resetFilter('items');
 
  LoginModel.filter('numbers')
    .using(function(a){ return (a > 2);})
    .and(function(a){ return (a < 5);});
  
  LoginModel.filter('items')
    .by('title')
    .using('userInput')
    .and(function(input, title){ _log(title + ' ' + input);return (title.indexOf(input) == 0);})
    .and(function(input){ return (input.length > 2);});
  
  //you could use a 'by' statement here as well, but then the item passed to call back is the value
  //of that 'by' property
  
  LoginModel.filter('items')
    .using(function(item){
       return (item.title.indexOf('P') == 0 || item.title.indexOf('T') == 0);
    })
    .and(function(item){
       return (item.price > 25);
    })
    .and(function(item){
      return (item.price < 201 );
    })
    LoginModel.sort('numbers')
    LoginModel.sort('items').orderBy('title').thenBy('price').thenBy('color');
  */
  
  LoginModel.sort('numbers').orderBy();
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