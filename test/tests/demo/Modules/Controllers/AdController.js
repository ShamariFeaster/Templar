structureJS.module('AdController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    AdsMdl = _Templar.getModel('Ads'),
    AdFormMdl = _Templar.getModel('AdForm'),
    SelectAllQuery = new (require('JRDBI').QueryCollection.SelectAll)(),
    EQ = require('JRDBI').Condition.EQ,
    mixin = require('Controller.NewAd.mixin'),
    AdCtrl = require('Controller')( mixin );

function populateAd(data){
  var ad = data.results[0];
    
  SelectAllQuery
    .condition( EQ('ad_id', AdFormMdl.ad_id) )
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

function fetchAd(){
  /* clear ad images */
  AdFormMdl.ad_images = [];

  SelectAllQuery
    .condition( EQ('ad_id', AdFormMdl.ad_id) )
    .execute('ads', populateAd);
}

AdCtrl.populateAd = populateAd;
AdCtrl.onload = fetchAd;
_Templar.success('#/show-ad/AdForm:ad_id', AdCtrl.onload);

return AdCtrl;
});