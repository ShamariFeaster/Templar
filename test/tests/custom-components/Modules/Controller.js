var mdl = Templar.getModel('Example');
mdl.listen('a', function(e){
  console.log(e);
})