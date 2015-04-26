structureJS.module('SearchAdController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('MyProfile'),
    AdSearchMdl = _Templar.getModel('AdSearch'),
    AdMetaMdl = _Templar.getModel('AdMetadata'),
    CommentFormMdl = _Templar.getModel('CommentForm'),
    Config = require('Config'),
    JRDBI = require('JRDBI'),
    SelectAllQuery = new JRDBI.QueryCollection.SelectAll(),
    LIKE = JRDBI.Condition.LIKE,
    mixin = require('Controller.NewAd.mixin'),
    SearchCtrl = require('Controller')( mixin ),
    AdCtrl = require('AdController'),
    AdMetaCtrl = require('MetaSidebarController'),
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
    SearchCtrl.getAds(e.value, AdSearchMdl.category.current_selection);
  });
  
  AdSearchMdl.listen('category', function(e){
    SearchCtrl.getAds(AdSearchMdl.adType.current_selection, e.value);
  });
  
  Helper.bindDateSort('#ad-search-date-sort', AdSearchMdl, 'returnedAds');
  Helper.bindTitleSort('#ad-search-title-sort', AdSearchMdl, 'returnedAds');

};

SearchCtrl.init = function(bannerMsg){
  AdSearchMdl.sort('adType');
  if(_.isDef(AdSearchMdl.adType.current_selection)){
      var prevCategory = AdSearchMdl.category.current_selection;
    AdSearchMdl.adType.current_selection = AdSearchMdl.adType.current_selection;
    AdSearchMdl.category.current_selection = prevCategory;
  }else{
    AdSearchMdl.update('adType');
    AdSearchMdl.adType.current_selection = 'For Sale';
    AdSearchMdl.category.current_selection = 'Jewelry';
  }
};
 
SearchCtrl.onload = function(){
  AdSearchMdl.keyword = '';
  SearchCtrl.init('Search Ads');
}; 

/* Keyword Filter */
AdSearchMdl
  .filter('returnedAds')
  .using('keyword')
  .and(function(input, ad){
    var regex = new RegExp('([\\s]+'+input+'|^'+input+')','i'),
        inputFound = regex.test((ad.title + ad.description));
    return (inputFound);
  });
  
_Templar.success('#/ad-search',SearchCtrl.onload);

_Templar.success('partials/Ad-Search/header.html', function(bannerMsg){
  AdSearchMdl.sort('adType');
  if(_.isDef(AdSearchMdl.adType.current_selection)){
      var prevCategory = AdSearchMdl.category.current_selection;
    AdSearchMdl.adType.current_selection = AdSearchMdl.adType.current_selection;
    AdSearchMdl.category.current_selection = prevCategory;
  }else{
    AdSearchMdl.update('adType');
    AdSearchMdl.adType.current_selection = 'For Sale';
    AdSearchMdl.category.current_selection = 'Jewelry';
  }
});
 
_Templar.success('#/ad-search/show-ad/AdSearch:ad_id/creator/AdMetadata:creatorUid', function(){
  CommentFormMdl.isWritingComment = false;
  Helper.setAdNav(AdSearchMdl.returnedAds, AdSearchMdl.ad_id, '#/ad-search/show-ad/', true);
  Helper.setAdBackBtn('#/ad-search');
  AdCtrl.populateAd( Helper.getAd(AdSearchMdl.returnedAds, AdSearchMdl.ad_id) );
  AdMetaCtrl.fetchMeta(AdMetaMdl.creatorUid);
}); 

_Templar.success('#/ad-search/add-comment/AdSearch:ad_id', function(){
  CommentFormMdl.isWritingComment = true;
  CommentFormMdl.label = 'Make a comment';
  CommentFormMdl.cancelHref = '#/ad-search/show-ad/'+AdSearchMdl.ad_id+'/creator/' + AdMetaMdl.creatorUid;
});

_Templar.success('#/ad-search/respond/AdSearch:ad_id', function(){
  CommentFormMdl.isWritingComment = true;
  CommentFormMdl.label = 'Respond To This Ad';
  CommentFormMdl.cancelHref = '#/ad-search/show-ad/'+AdSearchMdl.ad_id+'/creator/' + AdMetaMdl.creatorUid;
});
});