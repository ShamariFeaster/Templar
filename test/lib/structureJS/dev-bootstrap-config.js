structureJS.configure(
{
  styles : ['Bootstrap/css/bootstrap.min','Bootstrap/css/bootstrap-theme.min'],
  globals : [ 'lib/jquery',
            'Bootstrap/js/bootstrap.min',
            'templar/Constants', 
            'templar/Util', 
            'classes/ClassTMP_Node',
            'classes/ClassModel',
            'classes/Attribute.class',
            'classes/Component.class',
            'classes/Token.class',
            'templar/State',
            'templar/DOM'],
  directory_aliases : {modules : 'Modules/', 
                      templar : '../../../TemplarJS/', 
                      classes : '../../../TemplarJS/Classes/',
                      lib : '../../lib/',
                      bililite : '../../lib/bililiteRange/',
                      Bootstrap : '../../lib/js/bootstrap-3.3.4-dist/'}
});

