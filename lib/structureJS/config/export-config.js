structureJS.configure(
{
  globals : [
            'templar/Util', 
            'templar/Constants', 
            'classes/TMP_Node',
            'classes/ClassModel',
            'templar/DOM'],
  directory_aliases : {modules : 'Modules/', templar : 'core/', classes : 'core/Classes/'}
});