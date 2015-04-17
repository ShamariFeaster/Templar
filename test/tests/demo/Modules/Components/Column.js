structureJS.module('Column', function(require){


var System = require('System')
    _ = this;
    
Templar.component('column',{
  templateURL : 'Modules/Components/Column.html',
  attributes : {
    colnum : function(self, val){
      val = (_.isNullOrEmpty(val)) ? 0 : val;
      self._currOffsetLeft_ = 
        ((self._colWidth_ * val)) + 
        (self._parentLeft_ - self._currOffsetLeft_);
      self.style.left = self._currOffsetLeft_ + 'px';
    }
  },
  onCreate : function(self){
    var component = this;
    function init(){
      var colnum = self.getAttribute('colnum');
      self._parentWidth_ = self.parentNode.offsetWidth;
      self._parentLeft_ = self.parentNode.offsetLeft;
      self._colWidth_ = self._parentWidth_ / 10;
      self._currOffsetLeft_ = self.offsetLeft;
      component.attributes.colnum.call(component, self,colnum);
    }
    Templar.done(init);
    System.setSystemListeners(_.SYSTEM_EVENT_TYPES.repeat_built, init);

  }
});

});