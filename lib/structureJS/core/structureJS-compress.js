/*FIX:uglifyJS is a global dependency. Should add this to module description object to
      throw error if it isn't found*/
structureJS.module(
{
name: 'structureJS-compress', 
type : 'Driver'
}, 

function(require){
  var core = require('core');
  var dependency = require('structureJS-dependency');
  
  var combinedSrc = '';
  var projectBase = core.config.project_base;
  var globalBase = core.config.global_base;
  var exports = null;
  var wholeProject = core.state['pmiFileOrder'];
  var indexes = {};
  var exportList = {};
  var thisGroup = null;
  var _exportProject = false;
  var fileName = '';
  var orderedGroupComponents = null;
  var _coreFilename = core.config.core_base + core.NAME + '.js';
  var _dependencyFilename = core.config.core_base + core.DEPENDENCY + '.js';
  /* '.' DOES NOT match newlines, so here's the workaround */
  var deploymentRegex = /\/\*@StartDeploymentRemove\*\/[\S\s]*?\/\*@EndDeploymentRemove\*\//g;
  /*Configure
    tab : spaces | \t
    newlines : \n | \r\n
  */

  function compress(input){
    var res = minify(input, uglify_options);
    if (res.error) {
        throw res.error;
    }
    return res.code;
  }
  
  function parseFileList(){
    exports = core.state['pmiFilesSelectedForExport'].split(',');
    wholeProject = core.state['pmiFileOrder'];
    projectBase = core.config.project_base;
    globalBase = core.config.global_base;
    var files = [];
    var compressFlg = true;
    var NOT_GROUPED = 'NOTGROUPED';
    /*indexes are counters indexed on group name*/
    for(var i = 0; i < exports.length; i++){
      /*fileName could be soft group name*/
      compressFlg = true;
      if(/\-u$/.test(exports[i]) == true){
          exports[i] = exports[i].replace(/\-u$/,'');
          compressFlg = false;
        }
      fileName = exports[i].trim();
      
      thisGroup = core[fileName];

      
      if(typeof thisGroup == 'undefined'){
        if(typeof exportList['files'] == 'undefined' ){
          indexes[NOT_GROUPED] = 0;
          var exportObj = {name : NOT_GROUPED, files : files, output : '', compress : compressFlg};
          exportObj['files'].push({ filename : projectBase + fileName, compress : compressFlg});
          exportList[NOT_GROUPED] = exportObj;
        }else{
          exportList[NOT_GROUPED]['files'].push({ filename : projectBase + fileName, compress : compressFlg});
        }
        
        
        
      }else{
        indexes[fileName] = 0;
        orderedGroupComponents = dependency.orderImportsNoTLCChange(thisGroup.state['dependencyTree']);

        files = dependency.dereferenceGroups( orderedGroupComponents );
        
        for(var i = 0; i < files.length; i++){
          files[i] = { filename : projectBase + dependency.getFilename(files[i]) + '.js', compress : compressFlg}; 
        }
              
        var exportObj = {name : fileName, files : files, output : '', compress : compressFlg};
        exportList[fileName] = exportObj;
      }
      
      
    }
    
    for(var i = 0; i < exports.length; i++){

      if(exports[i].trim() == '*'){
        _exportProject = true;
        /*copy it because we consume it below and cannot be reused in subsequent 
        exports*/
        exports = wholeProject.slice(0);
        break;
      }
    }
    console.log(exports);
  }
  
  
  function processFileOutputForHtml(input){
    return input.replace(/\n/g,'<br>').replace(/  /g,'&nbsp&nbsp&nbsp&nbsp');
  }
  
  function processFileOutputForInnerText(input){
    return input.replace(/  /g,'\t');
  }

  /*The scoping on this is INSANE. I honestly don't even understand why it works 
  this way but it does. The callback executes in the context of the xhr request
  but it has access to the scope of the originating function (combineSrcFiles)
  so groupName stays the same through the whole sequence of xhr requests on
  a group's files array. This allows me to index on exportList and, more importantly,
  indexes. This is what creates the separation of the outputs. The synchonization
  is achieved     Because the scopes of combineSrcFiles and the module
  remain stable through my execution I am able to separate and synchonize the
  output from sequential, but interleaving, calls to getSrc.  */
  function combineSrcFiles(groupName){
    var tempOutput = '';
    var coutTag = document.getElementById(core.options.cout_tag_id);
    var minifiedTag = document.getElementById(core.options.minified_output_tag_id);
    
    if(coutTag)
      coutTag.innerText = '';
    if(minifiedTag)
      minifiedTag.innerText = '';
      
    function callback(){
      var wrappedFileObj = exportList[groupName].files[indexes[groupName]];
      if(indexes[groupName]++ < exportList[groupName].files.length){
        getSrc(exportList[groupName], callback);

        
        tempOutput = '\n' + this.responseText;
        if(wrappedFileObj.compress == true){
          tempOutput = compress(this.responseText);
        }
        
        //look at the scope of the xhr request for more info
        exportList[groupName].output += tempOutput;  
        //indexes[groupName];
      }
      /*note the postfix incrementation. I am able to detect completion, yet not
      index out of bounds b/c of this. By checking for OOB here I am able to 
      detect completion*/
      if(indexes[groupName] == exportList[groupName].files.length){
        console.log(groupName + ' Done'); 
        /*Output to console*/
        console.log('----- ' + groupName + '----- ');
        console.log(exportList[groupName].output);
        
        /*Download, if requested*/
        if(core.options.download_minified == true)
          location.href = "data:application/octet-stream," + encodeURIComponent(exportList[groupName].output);
        
        /*output to DOM*/
        if(exportList[groupName].compress == false){
          var coutTag = document.getElementById(core.options.cout_tag_id);
          if(coutTag)
            coutTag.innerText += exportList[groupName].output + '\n';
        }else{
          var minifiedTag = document.getElementById(core.options.minified_output_tag_id);
          if(minifiedTag)
            minifiedTag.innerText += exportList[groupName].output + '\n';
        }
        
        
        
        
        /*Should make this configurable b/c people hate popups*/
        //window.open('http://localhost/structureJS/pmi/export.html?exports=' + processFileOutputForHtml( exportList[groupName].output) );
        
        /*Reset variables*/
        /*For subsequent exports in the same session we need to clear our objects
        because they remain in memory*/
        delete indexes[groupName];
        delete exportList[groupName];
      }

    }

    if(exportList[groupName]){
      getSrc(exportList[groupName], callback);
    }
  }
  
  function getSrc(obj, callback){

    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    if(indexes[obj.name] < obj.files.length){
      xhr.open('get',  obj.files[indexes[obj.name]]['filename'], true);
      xhr.send();
    }
    
  }
  
  /*Project Exportation*/
  function combineProjectSrcFiles(fileName){
    function callback(){
      var text = this.responseText;
      /*this.onload.fileName is myself but with state data attached by my calling
      function. This may be a better way to handle the synchronization & separation 
      I use on group exports*/
      if(this.onload.fileName == core.config.core_base + core.NAME + '.js' 
        && core.options.preProcess == true){
        console.log('PROCESSIG DEPLOY VERSION');
        text = text.replace(deploymentRegex,'');
      }
      if(core.options.minify == true){
        combinedSrc += compress(text);
      }else{
        combinedSrc += text;
      }
      
      var nextFile = exports.shift();
      
      if(nextFile) {
        nextFile = (nextFile == _coreFilename || nextFile == _dependencyFilename) ?
                  nextFile : core.config.project_base + nextFile;
        getProjectSrc( nextFile, callback);
      } else{
        
        /*Output to console*/
        console.log(combinedSrc);
        
        /*output to DOM*/
        var minifiedTag = document.getElementById(core.options.minified_output_tag_id);
        if(minifiedTag)
          minifiedTag.innerText = combinedSrc;
        
        /*Download compressed file*/
        if(core.options.download_minified == true)
          location.href = "data:application/octet-stream," + encodeURIComponent(combinedSrc);        
        //window.open('http://localhost/structureJS/pmi/export.html?exports=' + combinedSrc); 
        //reset variables  
        /*For subsequent exports in the same session we need to clear our objects
        because they remain in memory*/
        combinedSrc = '';
        _exportProject = false;
        exportList = {}; // b/c '*' gets put in here & needs to be cleared
        /*note we don't clear exports because it is a copy of wholeProject which
        never */
            
      }
    }
    if(fileName)
      getProjectSrc(fileName, callback);
  }
  
  function getProjectSrc(fileName, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = callback;
    /*Super sweet way of attaching per-call data to callback function
    to give each callback a state*/
    xhr.onload.fileName = fileName;
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4){   //if complete
        if(xhr.status !== 200){  //check if "OK" (200)
          console.log(fileName + ' not found. Probably a bootstrap - trying one level above.');
          xhr.open('get',  '../' + fileName, true);
          xhr.send();
        }
      } 
    }

    xhr.open('get',  fileName, true);
    xhr.send();

    
    
  }
  
  
  var executeExport = function(){
    parseFileList();
    /*Driver*/
    if(_exportProject == true){
      
      if(core.flags['hasRemotes'] == false){

        if(core.options.preProcess == false){
          exports.unshift(_dependencyFilename);
        }
        
        exports.unshift(_coreFilename);
        
        combineProjectSrcFiles( exports.shift() );
      }
      else{
        throw 'Error: Cannot minify because you are using remote files in the project'; 
      }
      
    }else{
      for(var name in exportList){
        
        if(name){
          combineSrcFiles( name );
        }
        
      }
    }
  };
  //executeExport();

  return { executeExport : executeExport};
});