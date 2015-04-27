structureJS.configure(
{
   directory_aliases : 
    { modules : 'Modules/',
      controllers : 'Modules/Controllers/',
      components : 'Modules/Components/',
      templar : '../../../TemplarJS/', 
      classes : '../../../TemplarJS/Classes/',
      lib : '../../lib/',
      bootstrap : 'js/bootstrap/',
      build : '../../../build/'
    },
  styles : ['css/hover-min',
          'bootstrap/css/bootstrap.min',
          'bootstrap/css/bootstrap-theme.min',
          'css/style'],
          
  globals : [
      'js/jquery', 
      'bootstrap/js/bootstrap.min',
      'js/jquery.leanModal.min',
      'js/JRDBIQuery',
      'js/JRDBICondition','build/TemplarJS-0.11d.min'],
 
});

