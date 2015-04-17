structureJS.module('Column', function(require){


var System = require('System')
    _ = this;
    
Templar.component('column',{
  templateURL : 'Modules/Components/Column.html',
  attributes : {
    colnum : function(self, val){
      val = (_.isNullOrEmpty(val)) ? 0 : val;
      var left = parseInt(self.style.left.replace('px','')) || 0;
      self._currOffsetLeft_ = 
        ((self._colWidth_ * val) - (self._startLeft_ - left)) ;
      self.style.left = self._currOffsetLeft_ + 'px';
    }
  },
  onCreate : function(self){
    var colnum = self.getAttribute('colnum');
    self._parentWidth_ = self.parentNode.offsetWidth;
    self._parentLeft_ = self.parentNode.offsetLeft;
    self._colWidth_ = Math.floor(self._parentWidth_ / 10);
    self._currOffsetLeft_ =  self.offsetLeft;
    self._startLeft_ = self._currOffsetLeft_ - self._parentLeft_;
    this.attributes.colnum.call(this, self, colnum);
  }
});

});