Templar.component('OverlayButton', {
  templateURL : 'Modules/Components/OverlayButton.html',
  attributes : {
  
    overlay : function(self, val){
      var overlay = self.querySelector('[id=sf-overlay-image]');
      overlay.setAttribute('src', val);
    },
    
    src : function(self, val){
      var main = self.querySelector('[id=sf-main-image]');
      main.setAttribute('src', val);
    }
  },
  onCreate : function(self){
    var component = this;
    Templar.done(function(){
      var overlaySrc = self.getAttribute('overlay'),
          mainImgSrc = self.getAttribute('src');
      component.attributes.overlay.call(component, self, overlaySrc);
      component.attributes.src.call(component, self, mainImgSrc);
    });
  }
});