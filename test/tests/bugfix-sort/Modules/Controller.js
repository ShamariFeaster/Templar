$('#title').click(function(){
  var A = Templar.getModel('A');
  A.sort('a').orderBy('title');
  A.update('a');
});

$('#date').click(function(){
  var A = Templar.getModel('A');
  A.sort('a').orderBy('date').thenBy('title');
  A.update('a');
});