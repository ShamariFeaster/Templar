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
    
  AdFormMdl.title = ad.title;
  AdFormMdl.category.current_selection = ad.ad_category;
  AdFormMdl.adType.current_selection = ad.ad_type;
  AdFormMdl.update('adType');
  AdFormMdl.update('category');
  AdFormMdl.itemPrice = ad.price;
  AdFormMdl.description = ad.description;

}

function fetchAd(adId){
  /* clear ad images */
  

  SelectAllQuery
    .condition( EQ('ad_id', adId || MyAdsMdl.ad_id) )
    .execute('ads', function(data){
      populateAd(data.results[0])
    });
}

AdCtrl.populateAd = populateAd;
AdCtrl.fetchAd = fetchAd;

_Templar.success('#/my-ads/show-ad/MyAds:ad_id', function(){
         
  AdCtrl.populateAd( Helper.getAd(MyAdsMdl.ads, MyAdsMdl.ad_id) );
});

return AdCtrl;
});