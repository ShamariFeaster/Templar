structureJS.configure(
{
  globals : [
            'templar/Constants', 
            'templar/Util', 
            'classes/ClassTMP_Node',
            'classes/ClassModel',
            'templar/DOM'],
  directory_aliases : {modules : 'Modules/', 
                      templar : 'TemplarJS/', 
                      classes : 'TemplarJS/Classes/',
                      lib : 'TemplarJS/lib/'}
});

