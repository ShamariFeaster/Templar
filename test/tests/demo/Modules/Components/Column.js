structureJS.module('Column', function(require){


var System = require('System')
    _ = this;
    
Templar.component('column',{
  templateURL : 'Modules/Components/Column.html',
  attributes : {
    colnum : function(self, val){
      val = (_.isNullOrEmpty(val)) ? 0 : val;
      this.currOffsetLeft = 
        ((this.colWidth * val)) + (this.parentLeft - self.offsetLeft + this.currOffsetLeft);
      self.style.left = this.currOffsetLeft + 'px';
    }
  },
  onCreate : function(self){
    var colnum = self.getAttribute('colnum');
    this.parentWidth = self.parentNode.offsetWidth;
    this.parentLeft = self.parentNode.offsetLeft;
    this.colWidth = this.parentWidth / 10;
    this.currOffsetLeft = 0;
    this.attributes.colnum.call(this, self,colnum);

  }
});

});