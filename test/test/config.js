structureJS.configure(
{
    globals : [
            'templar/Constants', 
            'templar/Util', 
            'classes/TMP_Node',
            'classes/ClassModel',
            'templar/DOM'],
  directory_aliases : {
      components : 'Components/', 
      data : 'Data/',
      home : './',
      templar : '../../core/', 
      classes : '../../core/Classes/',
      spec : 'Spec/'}
});