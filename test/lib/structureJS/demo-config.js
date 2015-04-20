structureJS.configure(
{
  directory_aliases : 
    { modules : 'Modules/',
      controllers : 'Modules/Controllers/',
      components : 'Modules/Components/',
      templar : '../../../TemplarJS/', 
      classes : '../../../TemplarJS/Classes/',
      lib : '../../lib/',
      bootstrap : 'js/bootstrap/'
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
      'js/JRDBICondition',
      'templar/Constants', 
      'templar/Util', 
      'classes/ClassTMP_Node',
      'classes/ClassModel',
      'classes/Attribute.class',
      'classes/Component.class',
      'classes/Token.class',
      'templar/State',
      'templar/DOM'],
  
});

