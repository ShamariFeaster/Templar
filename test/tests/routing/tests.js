QUnit.asyncTest( 'Routing', function( assert ) {
  //expect( 2 );
  Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  }]);

  Templar.setAuthenticator(function(data){
    var result = {},
        data = {userName : 'me', password : 'abc123' };
    if(_.isDef(data) 
      && !_.isNullOrEmpty(data.userName)
      && !_.isNullOrEmpty(data.password)){
      //would be remote in real life
      result = { status : 200, role : 'Admin', expires : '19:00'};
    }
    
    return result;
  });
  
  Templar.setAuthorizer(function(data){

    var _ = structureJS.require('Util'),
        Route = structureJS.require('Route'),
        State = structureJS.require('State'),
        result = false,
        cookie;
        
    cookie = Route.authenticate({});       
    for(var prop in cookie){this[prop] = cookie[prop];}

    if(_.isDef(this.status) && this.status == 200){
      //check if cookie expired and set status accordingly
      switch(this.role){
        case 'Admin':
          result = true;
          _.log('User is Admin - Access To everything. Route ' + data.route);
          break;
        case 'User':
          //block admin pages
          _.log('User: checking requested route: ' + data.route);
          break;
      }
    }
    return result;
  });

  
  var $target = $('#target'),
      baseUrl = window.location.href,
      currHashChangeFunc = window.onhashchange;
      
  function addHashChangeAssertion(assertFunc){
    window.onhashchange = function(){
      currHashChangeFunc.call(null);
      assertFunc.call(null);
      window.onhashchange = currHashChangeFunc;
    };
  };
  
  assert.equal($target.html(),'target', 'inital value of target node correct');
  Templar.success('partial-route1.html', function(){
    assert.equal($target.html(),'Partial Route 1', 'Routing loaded partial contents.');

  });

  window.location.href = baseUrl + '#/route/1'; 
  
  addHashChangeAssertion(function(){
    assert.equal(Templar.getModel('Environment').footer,'newFooterVal', 'Set model var correctly');
    QUnit.start();
  });

  window.location.href = baseUrl + '#/setfooter/newFooterVal';
  
  try{
    Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },{
    route : '#/route/1'
  }]);
  }catch(e){
    assert.ok(true, e);
  }
   
  try{
    Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },{
    route : '#/Route/1'
  }]);
  }catch(e){
    assert.ok(true, e + ' Should be case-insensitive.' );
  } 
   
  try{
    Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },{
    route : '#/setfooter/Environment:base'
  }]);
  }catch(e){
    assert.ok(true, e);
    
  }
  
  try{
    Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },{
    route : '#/setFooter/Environment:Base'
  }]);
  }catch(e){
    assert.ok(true, e + ' Should be case-insensitive.');
    
  }
  
  try{
    Templar.Route([{
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },{
    route : '#/setfooter/Environment:base/blah'
  }]);
  
  assert.ok(true, 'Ambiguity avoided by longer route');
  }catch(e){}
  
  try{
    Templar.Route([
  {
    route : '#/route/1',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/route/1/blah',
    partial : 'partial-route1.html',
    target : '#target'
  },
  {
    route : '#/setfooter/Environment:footer',

  },
  {
    route : '#/setfooter/Environment:base/blah'
  }]);
  
  assert.ok(true, 'Duplication avoided by longer route');
  }catch(e){}
  
  
});