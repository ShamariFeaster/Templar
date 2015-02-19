Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  dialogHeight : 50,
  dialogColor : 'brown',
  range : [1,2,3,4,5,6]
});

Templar.component('dialog',{
  templateURL : 'prelim-spec-for-template.html',
  attributes : {
    color : function(self, val){
      self.setAttribute('class',  val );
    },
    height : function(self, val){
      self.setAttribute('style', 'font-size: ' + val + 'px;');
    }
  },
  onCreate : function(self){
    $('#up', self).click(function(){
        var $self = $(self);
        $self.attr('height', parseInt($self.attr('height')) + 1);
    });
    
    $('#down', self).click(function(){
        var $self = $(self);
        $self.attr('height', parseInt($self.attr('height')) - 1);
    });
    console.log('onCreate Called');
  }

});




