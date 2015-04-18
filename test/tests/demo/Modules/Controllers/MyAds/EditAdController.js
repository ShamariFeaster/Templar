structureJS.module('EditAdController', function(require){

var  _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    AdsMdl = _Templar.getModel('Ads'),
    AdFormMdl = _Templar.getModel('AdForm'),
    SelectAllQuery = new (require('JRDBI').QueryCollection.SelectAll)(),
    EQ = require('JRDBI').Condition.EQ,
    AdCtrl = require('AdController');
    CtgSlCtrl = require('CategorySelectController');
    
_Templar.success('#/edit-ad/AdForm:ad_id/state/AdForm:ad_state', function(){
  AdCtrl.onload();
  CtgSlCtrl.onload();
});

});