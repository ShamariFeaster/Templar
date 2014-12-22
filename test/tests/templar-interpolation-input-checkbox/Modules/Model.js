Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  checkbox : ['yellow','blue','green'],
  complex_checkbox : [{value : 'yellow', description : 'Pick yellow'},
                      {value : 'blue', description : 'Pick blue' },
                      {value : 'green', description : 'Pick green'}],
  repeat_checkbox : [{value : 'yellow', description : 'Pick yellow'},
                      {value : 'blue', description : 'Pick blue' },
                      {value : 'green', description : 'Pick green'}],
  range : [1,2,3]
});

