structureJS.module('MyProfileController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdsMdl = _Templar.getModel('Ads'),
    Config = require('Config'),
    SelectQuery = new (require('JRDBI').QueryCollection.Select)(),
    UpdateQuery = new (require('JRDBI').QueryCollection.Update)(),
    EQ = require('JRDBI').Condition.EQ,
    Controller = require('Controller')(),
    _$ = window.$;

Controller.bindHandlers = function(){
  
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
          Controller.bindHandlers();
        });
        
      /* rebuild destroys orig nodes and so we re-bind */

  });
}

Controller.init = function(){

  
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
      Controller.init('My Ads');
    });
    
  
});


});