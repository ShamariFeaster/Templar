Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  checkbox : ['yellow','blue','green'],
  complex_checkbox : [{value : 'yellow', description : 'Pick yellow'},
                      {value : 'blue', description : 'Pick blue' },
                      {value : 'green', description : 'Pick green'}]
});

