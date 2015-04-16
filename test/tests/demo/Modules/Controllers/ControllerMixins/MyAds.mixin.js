structureJS.module('Controller.MyAds.mixin', function(require){
  return (function(){

    /* Override of Contorller.loadPartial() */
    function loadPartial(partial, callback){
      var pObj = this.getPartialObj(partial);
      pObj.partial = this.cfg.myAdsPartialsDir + pObj.partial;
      pObj.target = this.cfg.myAdsTargetId;
      this._super.loadPartial.call(this, pObj , callback);
    }
    
    /* Constructor */
    return function(){
      var _this = this;
      this.cfg = this.w.structureJS.require('Config');
      this._super = { loadPartial : _this.loadPartial };
      this.loadPartial = loadPartial;
      return this;
    };
    
  })();
  
});