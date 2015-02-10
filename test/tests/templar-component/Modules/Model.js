Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  dialogHeight : 50,
  dialogColor : 'brown'
});
/*
Templar.component('bad_def',{
  templateURL : '',
  attributes : {
    width : function(self, val){
    
    },
    height : function(self, val){
      
    }
  },
  onCreate : function(self){
  
  }

});
*/
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
  
  }

});




