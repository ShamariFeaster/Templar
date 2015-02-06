Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  dialogWidth : 50,
  dialogHeight : 50
});

Templar.component('dialog',{
  templateURL : 'prelim-spec-for-template.html',
  attributes : {
    width : function(self, val){
    
    },
    height : function(self, val){
    
    }
  },
  onCreate : function(self){
  
  }

});


