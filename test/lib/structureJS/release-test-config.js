structureJS.configure(
{
  globals : ['lib/qunit',
             'lib/jquery', 
             'bililite/bililiteRange',
             'bililite/jquery.sendkeys',
             'build/templar-0.0.1-12-9-14.build'],
  directory_aliases : {modules : 'Modules/', 
                      templar : '../../../TemplarJS/', 
                      classes : '../../../TemplarJS/Classes/',
                      lib : '../../lib/',
                      bililite : '../../lib/bililiteRange/',
                      build : '../../../target/'}
});

