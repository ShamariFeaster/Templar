structureJS.module('ShowAdController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdsMdl = _Templar.getModel('Ads'),
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    SelectAllQuery = new (require('JRDBI').QueryCollection.SelectAll)(),
    EQ = require('JRDBI').Condition.EQ,
    Controller = require('Controller')(),
    _$ = window.$;

Controller.bindHandlers = function(){

}

Controller.init = function(){
  
  
}


_Templar.success('#/show-ad/Ads:currentAdId', function(){
  /* clear ad images */
  AdFormMdl.ad_images = [];
  
  SelectAllQuery
    .condition( EQ('ad_id', AdsMdl.currentAdId) )
    .execute('ads', function(data){
      var ad = data.results[0];
      
      SelectAllQuery
        .condition( EQ('ad_id', AdsMdl.currentAdId) )
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
    });
  
});

});