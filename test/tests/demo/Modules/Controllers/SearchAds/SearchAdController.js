structureJS.module('SearchAdController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdSearchMdl = _Templar.getModel('AdSearch'),
    Config = require('Config'),
    JRDBI = require('JRDBI'),
    SelectQuery = new JRDBI.QueryCollection.Select(),
    LIKE = JRDBI.Condition.LIKE,
    mixin = require('Controller.NewAd.mixin'),
    AdSearchCtrl = require('Controller')( mixin ),
    _$ = window.$;

AdSearchCtrl.sortCategories = function(){
  AdSearchMdl.sort('category');
  AdSearchMdl.update('category');
};

AdSearchCtrl.getAds = function(adType, category){
  
  function transformAdData(item){
    item.start = Helper.formatDate(item.start);
    item.title = Helper.elipsis(item.title, 25);
    return item;
  }
  
  SelectQuery
    .fields({price:true,
            title:true,
            start:true,
            ad_id:true})
    .condition( LIKE('ad_type', adType).and( LIKE('ad_category', category) ) )
    .execute('ads', function(data){
      data.results.map(transformAdData);
      AdSearchMdl.returnedAds = data.results;
    });
}

AdSearchCtrl.bindHandlers = function(){
  var AdSearchCtrl = this;

  AdSearchMdl.listen('adType', function(e){
    AdSearchMdl.category = AdTypeMap.Categories[e.value];
    AdSearchCtrl.sortCategories();
    AdSearchCtrl.getAds(AdSearchMdl.category.current_selection, e.value);
  });
  
  AdSearchMdl.listen('category', function(e){
    AdSearchCtrl.getAds(AdSearchMdl.adType.current_selection, e.value);
  });
};

AdSearchCtrl.init = function(bannerMsg){
  AdSearchMdl.sort('adType');
  AdSearchMdl.update('adType');
};
 
AdSearchCtrl.onload = function(){
  AdSearchCtrl.init('Search Ads');
}; 
_Templar.success('partials/Profile/ad-search.html', AdSearchCtrl.onload);
    
});