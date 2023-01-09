(function(page){
  /*Don't use core outside of core functions because it won't be a module
  in deployment b/c dep resolution will be turned off*/
  var _core = structureJS.require('core');
  var _export = structureJS.require('structureJS-export');
  var _$ = structureJS.require('domQuery');
  var dependecy = structureJS.require('structureJS-dependency');
  var onload = structureJS.require('queueOnload');
  
  var _member = {};
  _member.targets = {};
  _member.projectFiles = [];
  _member.projectGroups = {};
  _member.isPageFirstOpen = true;
  
  
  function constructTargetChkBx(_member, _core){
    _member.projectFiles = _core.state['pmiFileOrder'];
    _member.projectGroups = _core.state['declaredGroups'];
    /*files are declared file/groups of loaded project*/
    var files = _member.projectFiles.concat(_member.projectGroups);
    var row = null, label = null, nameTd = null, addTd = null, compressTd = null,
        checkbx = null;
    /*Construct Header Row*/
    var hdRow = document.createElement('tr'), hdName = document.createElement('td'),
    hdAdd = document.createElement('td'), hdCom = document.createElement('td');
    hdName.innerText = "File/Group Name"; hdAdd.innerText = "Add"; hdCom.innerText = "Compress";
    hdRow.appendChild(hdName); hdRow.appendChild(hdAdd); hdRow.appendChild(hdCom);
    _$('#target_builder').node().appendChild(hdRow);
    
    for(var i = 0; i < files.length; i++){
      row = document.createElement('tr');
      /*Construct td elements*/
      nameTd = document.createElement('td'); addTd = document.createElement('td');
      compressTd = document.createElement('td');
      /*Construct Filename Label*/
      label = document.createElement('label'); label.innerText = files[i];
      /*Set filename col width*/
      nameTd.appendChild(label); nameTd.setAttribute("width","200px");
      /*Add filename to targets lis*/
      _member.targets[files[i]] = {};
      _member.targets[files[i]].add = false;
      _member.targets[files[i]].compress = false;
      /*Create 'add' checkbx and bind filename to checkbx with data atrrib*/
      checkbx = document.createElement('input'); checkbx.type = 'checkbox'; checkbx.value = 'add';
      checkbx.setAttribute('data-file', files[i]);
      checkbx.setAttribute('class', 'file-selector-checkbox-add');
      /*Set listener on checkbx that adds/removes to targets list when checked*/
      checkbx.addEventListener('click', function(e){
        var name = e.target.getAttribute('data-file');
        console.log('Build List: ' + name);
        if(_member.targets[name] && e.target.checked == true){
          _member.targets[name].add = true;
        }else{
          _member.targets[name].add = false;
        }
      });
      
      addTd.appendChild(checkbx);
      /*Create 'add' checkbx and bind filename to checkbx with data atrrib*/
      checkbx = document.createElement('input'); checkbx.type = 'checkbox'; checkbx.value = 'compressed';
      checkbx.setAttribute('data-file', files[i]);
      checkbx.setAttribute('class', 'file-selector-checkbox-compress');
      /*Set listener on checkbx that adds/removes to targets list when checked*/
      checkbx.addEventListener('click', function(e){
        var name = e.target.getAttribute('data-file');
        console.log('Build List: ' + name);
        if(_member.targets[name] && e.target.checked == true){
          _member.targets[name].compress = true;
        }else{
          _member.targets[name].compress = false;
        }
      });
      
      compressTd.appendChild(checkbx);
      /*Append Dynamic row and keep going*/
      row.appendChild(nameTd);
      row.appendChild(addTd);
      row.appendChild(compressTd);
      _$('#target_builder').node().appendChild(row);
    }
  }
  
  /*Project Stroe Operations*/
  function initProjectStore(){
    var projectStore = {}
    projectStore.projects = {};
    projectStore.lastOpened = '';
    if(typeof localStorage['project_store'] == 'undefined'){
      localStorage['project_store'] = JSON.stringify(projectStore);
    }
  }
  function getProjectStore(){
    return JSON.parse(localStorage['project_store']).projects;
  }
  function getStore(){
    return JSON.parse(localStorage['project_store']);
  }
  function setStore(store){
    localStorage['project_store'] = JSON.stringify(store);
  }
  function addProject(projectObj){
    var store = getStore();
    store.projects[projectObj.project_name] = projectObj;
    setStore(store);
    
  }
  function deleteProject(projectName){
    var store = getStore();
    
    if(projectName !== '' && typeof store.projects[projectName] != 'undefined'){
      delete store.projects[projectName];
      setStore(store);
    }else{
      notifyUser('Project Name Not Recognized');
    }
  }
  
  /*Project Retrieval & Manip*/

  function getProjectNames(){
    var store = getProjectStore();
    var names = [];
    for(var name in store){
      names.push(name);
    }
    return names;
  }

  function loadProject(name){
    var store = getProjectStore();
    var project = store[name];
    if(typeof project != 'undefined'){
      /*Repopulate fields*/
      for(var inputName in project){
        console.log('Input name: ' + inputName);
        if(inputName != 'target')
        _$('#' + inputName).node().value = project[inputName];
      }
      
      doExport(false, _member);
      setLastOpened(name);
    }
    
  }
  
  function getLastOpened(){
    var store = getStore();
    console.log(store);
    return store.lastOpened;
  }
  
  function setLastOpened(name){
    var store = getStore();
    store.lastOpened = name;
    setStore( store );
  }
  
  function saveProject(_member){
    var projectData = {};
    projectData.project_name = _$('#project_name').node().value || '';
    projectData.target = buildTargetString(_member);
    projectData.project_location =  _$('#project_location').node().value || './';
    projectData.project_manifest_location =  _$('#project_manifest_location').node().value || './';
    projectData.project_manifest_name =  _$('#project_manifest_name').node().value || 'manifest';
    projectData.project_config_name =  _$('#project_config_name').node().value || 'config';
    projectData.project_config_location =  _$('#project_config_location').node().value || projectData.project_manifest_location;
    
    if(projectData.name == ''){
      notifyUser('Project Must Have A Name');
      return false;
    }
    addProject(projectData);
    updateSelect('#delete_select');
    updateSelect('#load_select');
  }

  /*Select Manip*/
  function clearSelect(id){
    var select = _$(id).node();
    var options = select.childNodes;
    for(var i = 0; i < options.length; i++){
      options[i].parentNode.removeChild(options[i]);
      i--;
    }

  }
  function updateSelect(id){
    //Remove '#'
    clearSelect(id);
    var select = _$(id).node();
    var pNames = getProjectNames();
    var option = null;

    for(var i = 0; i < pNames.length; i++){
      option = document.createElement('option');
      option.value = pNames[i];
      option.label = pNames[i];
      select.appendChild(option);
    }
  }

  function notifyUser(msg){
    console.log(msg);
  }
  /*script gloabals should be put on obj so the can be passed by reference*/
  function buildTargetString(_member){
    var filename = '';
    var target = null;
    var targetString = '';
    for(var file in _member.targets){
      filename = file;

      if(_member.targets[file].add == true){
        targetString += filename;
        
        if(_member.targets[file].compress == false){
          targetString += '-u';
        }
        
        targetString += ',';
          
        }
      
      
    }
    /*cut off trailing comma*/
    if(targetString != '')
      targetString = targetString.substr(0, targetString.length - 1);
    
    console.log('TARGET STRING: ' + targetString);
    return targetString;
  }
  
  function setExportObj(_member){
    var exportData = {}; 
    exportData.files = buildTargetString(_member);
    exportData.base_dir =  _$('#project_location').node().value || './';
    exportData.manifest_loc =  _$('#project_manifest_location').node().value || './';
    exportData.manifest_name =  _$('#project_manifest_name').node().value || 'manifest';
    exportData.config_name =  _$('#project_config_name').node().value || 'config';
    exportData.config_loc =  _$('#project_config_location').node().value || exportData.manifest_loc;
    return exportData;
  }
  
  function doExport(all, _member){
    var target = '', isNewProject = true, lastBaseDir = getLastOpened();
      
    var exportData = setExportObj(_member);
    /*If exporting whole project pass '*' to structureJS-compress*/  
    if(typeof all != 'undefined' && all === true)
      exportData.files = '*';
    
    if(lastBaseDir != ''){
      isNewProject = (lastBaseDir != exportData.base_dir);
      setLastOpened(exportData.base_dir);
    }

    if(_core.flags['exportInitiated'] == false){

      _export.init(exportData, function(errorMsg){
        if(errorMsg != null){
          /*Alert user that Circular was detected*/
          alert(errorMsg);
        }else{
          /*Grabbing Manifest Info For use in this context*/
          _export.getFilesAndGroups(function(){
            constructTargetChkBx(_member, _core);
          });
        }
        
      });
   
    }else{
      _export.update(exportData, function(errorMsg){
        if(errorMsg != null){
          /*Alert user that Circular was detected*/
          alert(errorMsg);
        }else if(isNewProject){
          _export.getFilesAndGroups(function(){
            _$('#target_builder').node().innerHTML = '';
            constructTargetChkBx(_member, _core);
          });
        }
        
      });
    }
  }
  
  onload.bind(function(){
    console.log('Content loaded');
    initProjectStore();
    updateSelect('#delete_select');
    updateSelect('#load_select');
    
    _$('#include-dependency').node().addEventListener('click', function(e){
      if(e.target.checked == true){
        _core.options.preProcess = false;
        _$('#include-dependency-feedback').node().innerHTML = 'Yes';
      }else{
        _core.options.preProcess = true;
        _$('#include-dependency-feedback').node().innerHTML = 'No';
      }
    });
    
    _$('#minify').node().addEventListener('click', function(e){
      if(e.target.checked == true){
        _core.options.minify = true;
        _$('#minify-feedback').node().innerHTML = 'Yes';
      }else{
        _core.options.minify = false;
        _$('#minify-feedback').node().innerHTML = 'No';
      }
    });
    
    _$('#delete_project').node().addEventListener('click', function(){
      deleteProject(_$('#delete_select').node().value);
      updateSelect('#delete_select');
      updateSelect('#load_select');
    });
    
    _$('#load_project').node().addEventListener('click', function(){
      loadProject(_$('#load_select').node().value);
    });
    
    _$('#save_project').node().addEventListener('click', function(){
      saveProject(_member);
    });

    
    _$('#export_component').node().addEventListener('click', function(){
      doExport(false, _member);
    });
    
    _$('#export_project').node().addEventListener('click', function(){
      doExport(true, _member);
    });
    
    _$('#add_all').node().addEventListener('click', function(){
      var checkboxes = document.querySelectorAll('.file-selector-checkbox-add');
      var event = document.createEvent('Event');
      event.initEvent('click', true, true);
      for(var i = 0; i < checkboxes.length; i++){
        checkboxes[i].checked = !checkboxes[i].checked;
        checkboxes[i].dispatchEvent(event);
      }
    });
    
    _$('#compress_all').node().addEventListener('click', function(){
      var checkboxes = document.querySelectorAll('.file-selector-checkbox-compress');
      var event = document.createEvent('Event');
      event.initEvent('click', true, true);
      for(var i = 0; i < checkboxes.length; i++){
        checkboxes[i].checked = !checkboxes[i].checked;
        checkboxes[i].dispatchEvent(event);
      }
    });
    
    _$('#download_output').node().addEventListener('click', function(e){
      _core.options.download_minified = e.target.checked;
    });
  });
  
})(document);

