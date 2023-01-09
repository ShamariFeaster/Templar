structureJS.configure(
{ 
  manifest_name : 'manifest/export-manifest',
  global_base : 'lib/',
  directory_aliases : {mod_lib : '../Modules/'},
  commons : [], 
  globals : []
},{
  download_minified : false,
  minified_output_tag_id : 'minified',
  cout_tag_id : 'cout'
});

