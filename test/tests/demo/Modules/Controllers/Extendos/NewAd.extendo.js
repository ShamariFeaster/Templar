structureJS.module('NewAd.extendo', function(require){
var extendo = {
  mdl : window.Templar.getModel('AdForm'),
  cfg : require('Config'),
  rt : require('Route'),
  prevBtn : function(isVisible, href, label){
    this.mdl.nav.prev.isVisible = isVisible;
    this.mdl.nav.prev.href = href || '#';
    this.mdl.nav.prev.label = label || 'Back';
    this.mdl.update('nav');
  },
  nextBtn : function(isVisible, href, label){
    this.mdl.nav.next.isVisible = isVisible;
    this.mdl.nav.next.href = href || '#';
    this.mdl.nav.next.label = label || 'Next';
    this.mdl.update('nav');
  },
  openPartial : function(partial, callback){
    var callback = callback || function(){};
    window.Templar.success(this.cfg.newAdPartialsDir + partial, callback);
    this.rt.openPartial(this.cfg.newAdPartialsDir + partial, this.cfg.newAdTargetId);
  }
};
return extendo;
});