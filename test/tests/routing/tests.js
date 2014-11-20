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