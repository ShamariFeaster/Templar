structureJS.module('Export', function(require){
var Templar = require('Templar');
Templar.success('#/paging', function(){
      var ExampleModel = Templar.getModel('Example');
      $('#page-up').click(function(){ExampleModel.pageDemo.page++;});
      $('#page-down').click(function(){ExampleModel.pageDemo.page--;});
    });
    
    Templar.success('#/filter-and-sort', function(){
      var Example = Templar.getModel('Example'),
         Taxonomy = Templar.getModel('Taxonomy');
      
      $('.scramble').click(function(e){
        var attribName = e.currentTarget.getAttribute('x-target');
        Example[attribName].map(function(item,i,arr){
          var newIndex = Math.floor(Math.random() * (arr.length - 0)) + 0;
          var a = arr[i];
          var b = arr[newIndex];
          arr[newIndex] = a;
          arr[i] = b;
        });
        Example.update(attribName);
      });
      
     $('.sort').click(function(e){
        var attribName = e.currentTarget.getAttribute('x-target');
        Example.sort(attribName);
        Example.update(attribName);
      }); 
      
      $('.sortableColumn').click(function(e){
        var column = e.currentTarget.getAttribute('x-name');
        //var compliment = Taxonomy.columns.filter(function(name){return (name != sortcol);})
        Taxonomy.sort('data').orderBy(column);
        Taxonomy.update('data'); 
      });
    });
    
});