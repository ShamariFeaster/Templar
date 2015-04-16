structureJS.module('Controller.NewAd.mixin', function(require){

return (function(){
   function prevBtn(isVisible, href, label){
    this.mdl.nav.prev.isVisible = isVisible;
    this.mdl.nav.prev.href = href || '#';
    this.mdl.nav.prev.label = label || 'Back';
    this.mdl.update('nav');
  }
   function nextBtn(isVisible, href, label){
    this.mdl.nav.next.isVisible = isVisible;
    this.mdl.nav.next.href = href || '#';
    this.mdl.nav.next.label = label || 'Next';
    this.mdl.update('nav');
  }
  /* Override of Contorller.loadPartial() */
  function loadPartial(partial, callback){
    var pObj = this.getPartialObj(partial);
    pObj.partial = this.cfg.newAdPartialsDir + pObj.partial;
    pObj.target = this.cfg.newAdTargetId;
    /* context will be '_super' (which has no  getPartialObj())
        breaking _super.loadPartial() unless we set it back to Controller */
    this._super.loadPartial.call(this, pObj , callback);
  }
  
  /* Constructor */
  return function(){
    var _this = this;
    this.mdl = this.w.Templar.getModel('AdForm');
    this.cfg = this.w.structureJS.require('Config');
    this._super = { loadPartial : _this.loadPartial };
    this.loadPartial = loadPartial;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    return this;
  };
})();

});