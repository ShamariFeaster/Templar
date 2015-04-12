structureJS.configure(
{
  directory_aliases : 
    { modules : 'Modules/',
      controllers : 'Modules/Controllers/',
      components : 'Modules/Components/',
      templar : '../../../TemplarJS/', 
      classes : '../../../TemplarJS/Classes/',
      lib : '../../lib/'
    },
  styles : ['css/style','css/hover-min'],
  
  globals : [
      'lib/jquery', 
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

