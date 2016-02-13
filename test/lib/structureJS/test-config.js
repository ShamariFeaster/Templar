structureJS.configure(
{
  globals : ['lib/qunit',
             'lib/jquery', 
             'bililite/bililiteRange',
             'bililite/jquery.sendkeys',
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
                      bililite : '../../lib/bililiteRange/'}
});

