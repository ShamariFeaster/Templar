/*

Untested features as of 2-14-16 :

UI states: 

{
  route : '#/my-ads/show-ad/MyAds:ad_id',
  partial : ['#/main-layout',
    {
      partial : 'partials/Show-Ad/wrapper.html',
      target : '#layout-center-col'
    },
    {
      partial : 'partials/New-Ad/preview.html',
      target : '#ad-container'
    }
  ]
 
}
Fallback error cases:

partial file not found (404)
route component target node not found

Fallbacks for UI state component: 

{
    route : '#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri',
    partial : ['#/main-layout',
    { 
      partial : 'partials/New-Ad/wrapper.html', 
      target : '#layout-center-col',
      fallback : '#/new-ad'
    }]
    
}

Fallback for stand-alone  route:

{
    route : '#/new-ad/2',
    partial : 'partials/New-Ad/wrapper.html',
    target : '#layout-center-col',
    fallback : '#/new-ad'
}

*/
QUnit.asyncTest( 'Routing', function( assert ) {
  expect( 9 );
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
      
  function addHashChangeAssertion(assertFunc, beforeOnhashchange){
    window.onhashchange = function(){
      if(typeof beforeOnhashchange !== 'undefined' && 
        beforeOnhashchange != null &&
        typeof beforeOnhashchange.call !== 'undefined'
        ){
        beforeOnhashchange.call(null);
      }
      currHashChangeFunc.call(null);
      assertFunc.call(null);
      window.onhashchange = currHashChangeFunc;
    };
  };
  
  assert.equal($target.html(),'target', 'inital value of target node correct');
  
  Templar.success('partial-route1.html', function(){
    assert.equal($target.html(),'Partial Route 1', 'Routing loaded partial contents.');
    QUnit.start();
  });
  
  addHashChangeAssertion(function(){
    assert.equal(Templar.getModel('Environment').footer,'newFooterVal', 'Set model var correctly');
    QUnit.start();
    window.location.href = baseUrl + '#/route/1'; 
    /* 2-14-16
    Every call to Templar.Route() clobers the existing route tree. Since this test is async
      the state of the route tree is pseudo non-deterministic. This is solved by adding 
      beforeOnhashchange to addHashChangeAssertion. It is un-intuitive that beforeOnhashchange parameter
      is _after_ assertFunc, but whatever. I'm the only bastard reading this anyways.*/
  }, function(){
    Templar.Route([{
      route : '#/route/1',
      partial : 'partial-route1.html',
      target : '#target'
    },
    {
      route : '#/setfooter/Environment:footer',

    }]);
    
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
  //waiting for 'success' (above) to be run, we stop test runner.
  QUnit.stop();
  }catch(e){}
  
  
});