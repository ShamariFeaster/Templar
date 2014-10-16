structureJS.module('LoginCotroller', function(require){
    
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
  
  });
  */

  var Templar = require('Templar'),
      LoginModel = Templar.getModel('Login'),
      EnvModel = Templar.getModel('Environment');
  
  /*Itial page limit*/
  LoginModel.limit('comments').to(3);
    
  Templar.success('partial-login-screen.html', function(){

    LoginModel.resetLiveFiltersOf('comments');
    
    var audioplayers = Templar('audioPlayer');

    /*Put listener on control children*/
    audioplayers.listenTo('play').forEvent('click', function(e, index){
      console.log('Play Click ' + index + ' '  + e.player.src);
      e.player.node.play();
      //e.next.hide();
      
    });
    
    audioplayers.listenTo('pause').forEvent('click', function(e, index){
      console.log('Pause Click ' + index);
      e.player.node.pause();
      //e.next.show();
    });
    
    /*Listen to select changes*/
    LoginModel.listen('limits', function(e){
      LoginModel.limit('comments').to(e.value);
      LoginModel.update('comments');
    });
    
    LoginModel.listen('searchBy', function(e){
      LoginModel
        .filter('comments')
        .by(e.value)
        .using('userInput');
    });
    
    LoginModel.listen('orderBy', function(e){
      LoginModel
        .sortCurrentPageOf('comments')
        .orderBy(e.value);
      LoginModel.update('comments');
    });
    
    /*Pagination*/
    Templar('prev').listen('click', function(){
      LoginModel.gotoPreviousPageOf('comments');
    });
    
    Templar('next').listen('click', function(){
      LoginModel.gotoNextPageOf('comments');
    });
    
    
  });
  
  return {};
});