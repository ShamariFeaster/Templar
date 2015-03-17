structureJS.configure(
{
  styles : ['css/style'],
  globals : [
             'lib/jquery', 
             'js/jquery.leanModal.min',
             'bililite/bililiteRange',
             'bililite/jquery.sendkeys',
            'templar/Constants', 
            'templar/Util', 
            'classes/ClassTMP_Node',
            'classes/ClassModel',
            'templar/DOM'],
  directory_aliases : {modules : 'Modules/',
                       controllers : 'Modules/Controllers/',
                      templar : '../../../TemplarJS/', 
                      classes : '../../../TemplarJS/Classes/',
                      lib : '../../lib/',
                      bililite : '../../lib/bililiteRange/'}
});

