Templar = structureJS.require('Templar');

Templar.dataModel('test',{
  checkbox : ['yellow','blue','green'],
  complex_checkbox : [{value : 'yellow', description : 'Pick yellow'},
                      {value : 'blue', description : 'Pick blue' },
                      {value : 'green', description : 'Pick green'}],
  repeat_checkbox : [{value : 'yellow', description : 'Pick yellow'},
                      {value : 'blue', description : 'Pick blue' },
                      {value : 'green', description : 'Pick green'}],
  range : [1,2,3],
  form1 : [{cb_val1 : 0, cb_desc1 : 'Red',
            cb_val2 : 1, cb_desc2 : 'Blue'},
           {cb_val1 : 2, cb_desc1 : 'Grey',
            cb_val2 : 3, cb_desc2 : 'Cobalt'}]
});

