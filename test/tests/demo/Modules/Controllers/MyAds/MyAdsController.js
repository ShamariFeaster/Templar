structureJS.module('MyAdsController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    mdl_MyProfile = _Templar.getModel('MyProfile'),
    AdsMdl = _Templar.getModel('MyAds'),
    Config = require('Config'),
    JRDBI = require('JRDBI'),
    SelectAllQuery = new JRDBI.QueryCollection.SelectAll(),
    DeleteQuery = new JRDBI.QueryCollection.Delete(),
    UpdateQuery = new JRDBI.QueryCollection.Update(),
    EQ = JRDBI.Condition.EQ,
    mixin = require('Controller.MyAds.mixin'),
    MyAdsCtrl = require('Controller')(mixin),
    _$ = window.$;

/* This covers repeat rebuilding due to limiting/paging */
AdsMdl.listen('ads', function(e){
  MyAdsCtrl.bindHandlers();
});
    
MyAdsCtrl.bindHandlers = function(){

  function changeAdState(e){
    var ad_id = e.currentTarget.getAttribute('ad_id'),
       index = e.currentTarget.getAttribute('index'),
       newAdState = '';

      ad = AdsMdl.ads[index];
      
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
          ad.ad_state = ad.state = newAdState;
          AdsMdl.update('ads');
          
        });
        
      /* rebuild destroys orig nodes and so we re-bind */

  }
  
  function deleteAd(e){
    var ad_id = e.currentTarget.getAttribute('ad_id'),
       index = parseInt(e.currentTarget.getAttribute('index')),
       ad = AdsMdl.ads[index],
       confirmResponse = window.confirm('Do you want to delete "'+ad.title+'"?');
    
    if(confirmResponse == true){

      DeleteQuery      
        .condition( EQ('ad_id', ad_id) )
        .execute('ads', function(){
          AdsMdl.ads.splice( (index + ((AdsMdl.ads.page - 1) * AdsMdl.ads.limit)),1);
          AdsMdl.update('ads');
        });
    
    }
    
  }
  
  _$('.change-ad-state').click(changeAdState);
  _$('.delete-ad').click(deleteAd);

  Helper.bindDateSort('#my-ads-date-sort', AdsMdl, 'ads');
  Helper.bindTitleSort('#my-ads-title-sort', AdsMdl, 'ads');
  
}

_Templar.success('#/my-ads', function(){
  AdsMdl.ads = [];
  Helper.init('My Ads');
  
  Helper.fetchAds(mdl_MyProfile.uid, function(ads){
    AdsMdl.ads = ads;
  });
  
    
  
});


});