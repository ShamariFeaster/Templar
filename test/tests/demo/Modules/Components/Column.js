structureJS.module('Column', function(require){


var System = require('System')
    _ = this;
    
Templar.component('column',{
  templateURL : 'Modules/Components/Column.html',
  attributes : {
    colnum : function(self, val){
      val = (_.isNullOrEmpty(val)) ? 0 : val;
      var endLeft = ((this.colWidth * val)) + (this.parentLeft - self.offsetLeft);
      self.style.left = endLeft + 'px';
    }
  },
  onCreate : function(DOM_component){
    var component = this;
    
    Templar.done(function(){
      component.parentWidth = DOM_component.parentNode.offsetWidth;
      component.parentLeft = DOM_component.parentNode.offsetLeft;
      component.colWidth = component.parentWidth / 10;
      component.colnumVal = DOM_component.getAttribute('colnum');
      component.attributes.colnum.call(component, DOM_component,component.colnumVal);
    });
  }
});

});