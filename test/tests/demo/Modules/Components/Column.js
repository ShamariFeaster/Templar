Templar.component('column',{
  templateURL : 'Modules/Components/Column.html',
  attributes : {
    colnum : function(self, val){
      self.setAttribute('style', 'left : ' + this.colWidth * val + 'px;');
    }
  },
  onCreate : function(DOM_component){
    this.parentWidth = DOM_component.parentNode.offsetWidth;
    this.colWidth = this.parentWidth / 10;
  }
});