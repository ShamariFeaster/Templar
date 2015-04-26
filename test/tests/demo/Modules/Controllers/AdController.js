structureJS.module('AdController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    MyAdsMdl = _Templar.getModel('MyAds'),
    AdFormMdl = _Templar.getModel('AdForm'),
    SelectAllQuery = new (require('JRDBI').QueryCollection.SelectAll)(),
    EQ = require('JRDBI').Condition.EQ,
    mixin = require('Controller.NewAd.mixin'),
    AdCtrl = require('Controller')( mixin );

/* This is re-used in Ad Search when idv ad is selected for viewing*/
function populateAd(ad){
  if(_.isNull(ad)){
    _.log('adController.populateAd() : ad was not found');
    return;
  } 
  
  AdFormMdl.ad_images = [];
  
  SelectAllQuery
    .condition( EQ('ad_id', ad.ad_id) )
    .execute('pics', function(rows){
      
      rows.results.map(function(item){
        Helper.pushAdPic(item.image_uri, item.ad_pic_id);
      });

    });
  /* the setting of adType and category should be optional as it's causing unecessary
      firing of listeners where there*/
  AdFormMdl.title = ad.title;
  AdFormMdl.adType.current_selection = ad.ad_type;
  AdFormMdl.category.current_selection = ad.ad_category;
  AdFormMdl.update('adType');
  AdFormMdl.update('category');
  AdFormMdl.itemPrice = ad.price;
  AdFormMdl.description = ad.description;

}

AdCtrl.populateAd = populateAd;

_Templar.success('#/my-ads/show-ad/MyAds:ad_id', function(){    
  AdCtrl.populateAd( Helper.getAd(MyAdsMdl.ads, MyAdsMdl.ad_id) );
  Helper.setAdNav(MyAdsMdl.ads, MyAdsMdl.ad_id, '#/my-ads/show-ad/');
  Helper.setAdBackBtn('#/my-ads');
});

return AdCtrl;
});