structureJS.module('MyProfileController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    MyAdsMdl = _Templar.getModel('MyAds'),
    Config = require('Config'),
    SelectAllQuery = new (require('JRDBI').QueryCollection.SelectAll)(),
    UpdateQuery = new (require('JRDBI').QueryCollection.Update)(),
    EQ = require('JRDBI').Condition.EQ,
    Controller = require('Controller')(),
    _$ = window.$;

Controller.bindHandlers = function(){

}

Controller.init = function(){
  SelectAllQuery
    .condition( EQ('uid', UserProfileModel.uid) )
    .execute('ads', function(data){
      
      data.results.map(function(item){
        /*format date*/
        var date = new Date(item.start);
        item.start = [(date.getMonth()+1),date.getDate(),date.getFullYear()].join('/');
        /* truncate title */
        item.title = Helper.elipsis(item.title, 10);
        return item;
      });
      MyAdsMdl.ads = data.results;
    });
}
_Templar.success('#/my-ads', function(){
  Controller.init('My Ads');
});
    
});