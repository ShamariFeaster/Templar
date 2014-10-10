structureJS.module('LoginCotroller', function(require){
  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');
    
  /*
  //Limit any sequential data attrib, like those backing repeats
  LoginModel.limit('items').to(4);
  
  //Pagination (updates View)
  LoginModel.gotoPage(2).of('list');

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
  

  //Live filter by property
  LoginModel.filter('countries')
  .by('text')
  .using('userInput');
  

  //Live filtera
  LoginModel.filter('list').using('userInput');
    
  LoginModel.filter('items')
  .by('title')
  .using('userInput');

  //reset static filtered data to unfiltered, remove all live filters
  LoginModel.resetFilter('items');
 
  //Live filter with input filtering and overridding default startsWith filtering
  LoginModel.filter('items')
    .by('title')
    .using('userInput')
    .and(function(input, title){ return (title.indexOf(input) == 0);})
    .and(function(input){ return (input.length > 2);});

  //static filter with overridden default filter and other filter on different properties
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
    
  //Basic sort
  LoginModel.sort('numbers').orderBy();
    
  //Cascading sort
  LoginModel.sort('items').orderBy('title').thenBy('price').thenBy('color');
  
  //Page sort(s) (Updates View)
  LoginModel.sortPage(3).of('numbers').orderBy();
  LoginModel.sortPage(2).of('items').orderBy('title').thenBy('price');
  
  console.log(LoginModel.attributes['items']);
  
  //Repeat Contorls
  var audioplayers = Templar('audioPlayer');
  
  //listenTo() called on a control will look for id's of control's children
  audioplayers.listenTo('play').for('onclick', function(self){
    self.player.play();
  };
  
  //Single Controls
  Templar.listenTo('sortByPrice').forEvent('onclick', function(){
  
  //Put listener on control children
    audioplayers.listenTo('play').forEvent('click', function(e, index){
      console.log('Paly Click ' + index);
    });
    
    audioplayers.listenTo('pause').forEvent('click', function(e, index){
      console.log('Pause Click ' + index);
    });
    
    audioplayers.listenTo('prev').forEvent('click', function(e, index){
      console.log('Prev Click ' + index);
    });
    
    audioplayers.listenTo('next').forEvent('click', function(e, index){
      console.log('Next Click ' + index);
    });
    
    /*Put listener on control itself
    Templar('audioPlayer').listen('click', function(e, index){
      console.log('Self Click ' + index);
    });
    
    //ForEach for a given control set
    audioplayers.forEach(function(children, i){
    });
  
  });
  */

  function bindListeners(){
    var numberChanger = Templar('numberChanger');
    
    numberChanger.listenTo('increment').forEvent('click', function(e, index){
      LoginModel.numbers[index]++;
      LoginModel.numbers = LoginModel.numbers;
    });
    
    
    numberChanger.listenTo('decrement').forEvent('click', function(e, index){
      LoginModel.numbers[index]--;
      LoginModel.numbers = LoginModel.numbers;
    });
  }
  
  Templar.success('partial-login-screen.html', function(){
    
    bindListeners();
    Templar('sort').listen('click', function(){
      LoginModel.sort('numbers').orderBy();
      LoginModel.update('numbers');
    });
    LoginModel.listen('numbers', function(){
      bindListeners();
    });
    

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