structureJS.module('MyAdsController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdsMdl = _Templar.getModel('Ads'),
    Config = require('Config'),
    JRDBI = require('JRDBI'),
    SelectQuery = new JRDBI.QueryCollection.Select(),
    DeleteQuery = new JRDBI.QueryCollection.Delete(),
    UpdateQuery = new JRDBI.QueryCollection.Update(),
    EQ = JRDBI.Condition.EQ,
    mixin = require('Controller.MyAds.mixin'),
    MyAdsCtrl = require('Controller')(mixin),
    _$ = window.$;

/* This covers repeat rebuilding due to limiting/paging */
AdsMdl.listen('myAds', function(e){
  MyAdsCtrl.bindHandlers();
});
    
MyAdsCtrl.bindHandlers = function(){
  
  _$('.change-ad-state').click(function(e){
    var ad_id = e.currentTarget.getAttribute('ad_id'),
       index = e.currentTarget.getAttribute('index'),
       newAdState = '';

      ad = AdsMdl.myAds[index];

      switch(ad.action){
        case 'Post Ad':
          ad.action = 'De-List';
          newAdState = 'active';
          //update ad_state in DB
          break;
        case 'De-List':
          ad.action = 'Re-List';
          newAdState = 'deactivated';
          break;
        case 'Re-List':
          ad.action = 'De-List';
          newAdState = 'active';
          break;
      }

      UpdateQuery
        .fields({'ad_state' : newAdState})
        
        .condition( EQ('ad_id', ad_id) )
        
        .execute('ads', function(){
          ad.ad_state = newAdState;
          AdsMdl.update('myAds');
          
        });
        
      /* rebuild destroys orig nodes and so we re-bind */

  });
  
  _$('.delete-ad').click(function(e){
    var ad_id = e.currentTarget.getAttribute('ad_id'),
       index = e.currentTarget.getAttribute('index'),
       ad = AdsMdl.myAds[index],
       confirmResponse = window.confirm('Do you want to delete "'+ad.title+'"?');
    if(confirmResponse == true){

      DeleteQuery      
        .condition( EQ('ad_id', ad_id) )
        .execute('ads', function(){
          AdsMdl.myAds.splice(index,1);
          AdsMdl.update('myAds');
          MyAdsCtrl.bindHandlers();
        });
    
    }
    
  });
}

MyAdsCtrl.init = function(){

  
}

_Templar.success('#/my-ads', function(){
  
  function transformAdData(item){
    
    /*format date*/
    var date = new Date(item.start);
    item.start = [(date.getMonth()+1),date.getDate(),date.getFullYear()].join('/');
    
    /* truncate title */
    item.title = Helper.elipsis(item.title, 25);
    
    switch(item.ad_state){
      case 'draft':
        item.action = 'Post Ad';
        break;
      case 'active':
        item.action = 'De-List';
        break;
      case 'deactivated':
        item.action = 'Re-List';
        break;
    }

    return item;
  }
  
  SelectQuery
    .fields({ start:true,
            title:true,
            ad_id:true,
            ad_state:true})
            
    .condition( EQ('uid', UserProfileModel.uid) )
    
    .execute('ads', function(data){
      data.results.map(transformAdData);
      AdsMdl.myAds = data.results;
      MyAdsCtrl.init('My Ads');
    });
    
  
});


});