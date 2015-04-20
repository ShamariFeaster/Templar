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
    SelectAllQuery = new JRDBI.QueryCollection.SelectAll(),
    LIKE = JRDBI.Condition.LIKE,
    mixin = require('Controller.NewAd.mixin'),
    SearchCtrl = require('Controller')( mixin ),
    AdCtrl = require('AdController'),
    _$ = window.$;

SearchCtrl.sortCategories = function(){
  AdSearchMdl.sort('category');
  AdSearchMdl.update('category');
};

SearchCtrl.getAds = function(adType, category){
  
  function transformAdData(item){
    item.start = Helper.formatDate(item.start);
    item.title = Helper.elipsis(item.title, 25);
    return item;
  }
  
  SelectAllQuery
    .condition( LIKE('ad_type', adType).and( LIKE('ad_category', category) ) )
    .execute('ads', function(data){
      data.results.map(transformAdData);
      AdSearchMdl.returnedAds = data.results;
    });
}

SearchCtrl.bindHandlers = function(){
  var SearchCtrl = this;

  AdSearchMdl.listen('adType', function(e){
    AdSearchMdl.category = AdTypeMap.Categories[e.value];
    SearchCtrl.sortCategories();
    SearchCtrl.getAds(AdSearchMdl.category.current_selection, e.value);
  });
  
  AdSearchMdl.listen('category', function(e){
    SearchCtrl.getAds(AdSearchMdl.adType.current_selection, e.value);
  });
};

SearchCtrl.init = function(bannerMsg){
  AdSearchMdl.sort('adType');
  AdSearchMdl.update('adType');
};
 
SearchCtrl.onload = function(){
  AdSearchMdl.keyword = '';
  SearchCtrl.init('Search Ads');
}; 

AdSearchMdl
  .filter('returnedAds')
  .using('keyword')
  .and(function(input, ad){
    var regex = new RegExp('([\\s]+'+input+'|^'+input+')','i'),
        inputFound = regex.test((ad.title + ad.description));
    return (inputFound);
  });

_Templar.success('partials/Profile/ad-search.html', SearchCtrl.onload);
 
 _Templar.success('#/ad-search/show-ad/AdSearch:ad_id', function(){
    AdCtrl.populateAd( Helper.getAd(AdSearchMdl.returnedAds, AdSearchMdl.ad_id) );
 });   
});