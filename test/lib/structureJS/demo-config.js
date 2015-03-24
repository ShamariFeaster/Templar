structureJS.configure(
{
  styles : ['css/style'],
  globals : [
             'lib/jquery', 
             'lib/GeoInfo',
             'modules/Data/Type-Category-Map',
             'js/jquery.leanModal.min',
             'bililite/bililiteRange',
             'bililite/jquery.sendkeys',
            'templar/Constants', 
            'templar/Util', 
            'classes/ClassTMP_Node',
            'classes/ClassModel',
            'classes/Attribute.class',
            'classes/Component.class',
            'templar/DOM'],
  directory_aliases : {modules : 'Modules/',
                       controllers : 'Modules/Controllers/',
                       components : 'Modules/Components/',
                      templar : '../../../TemplarJS/', 
                      classes : '../../../TemplarJS/Classes/',
                      lib : '../../lib/',
                      bililite : '../../lib/bililiteRange/'}
});

