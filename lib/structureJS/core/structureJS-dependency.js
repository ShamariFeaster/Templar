structureJS.module('structureJS-dependency',function(require){
var core = require('core');
return {
  /*
  @method getFilename
  @module dependency
  
  @return {String} file name
  */
  getFilename : function(input){
    var fileName = '';
    if( input && typeof input === 'object' )
      fileName = Object.keys(input)[0];
    else if(typeof input === 'string')
      fileName = input;
    return fileName;
  },
  /*
  @method printOrder
  @module dependency
  
  @return 
  */
  printOrder : function(msg, modules, priority){
    var priority = (typeof priority == 'undefined') ? 1 : priority;
    var output = msg || '';
    for(var i = 0; i < modules.length; i++){
      output += this.getFilename( modules[i] ) + ', ';
    }
    console.log(output);
  },
  /*
  @method 
  @module dependency
  
  @return 
  */
  detectUndeclaredGroupDependency : function(treeName, depName){
    var retVal = true;
    var needTree = null;
    console.log('detectUndeclaredGroupDependency');
    console.log(core);
    if(typeof core[treeName] != 'undefined'){
      needTree = core[treeName].state['dependencyTree'];
    }else{
      needTree = core.state['dependencyTree'];
    }
    /*tc - tree component*/
    for(var tc in needTree){//for Group Component (GC)
      if(depName == tc)
        retVal = false;
    }
 
    return retVal;
  },
  /*When given a group name, we get that group's needTree*/
  /*
  @method 
  @module dependency
  
  @return 
  */
  detectGroupCircularDependency : function(trgGroupName, circularName ){
    /*Short circuit if this isn't group*/
    if(core.state['declaredGroups'].indexOf(trgGroupName) == -1)
      return 0;
     
    /*Check if declared groups are dependencies. If they aren't then I need to
      remove them from TLC. Removal happens in orderImports()*/ 
    if(core.state['declaredGroups'].indexOf(trgGroupName) > -1)
      core.state['groupsInTLC'][trgGroupName] = 1;
      
    var circularName = (typeof circularName == 'undefined')? '' : circularName;
    var retVal = 0;
    var thisDepList = null;
    var thisDepName = '';
    var groupNeedTree = core[trgGroupName].state['dependencyTree'];
    
    for(var modName in groupNeedTree){
      
      
      /*Check if the GC is a circular*/
      if(modName == circularName)
          return 1;
      thisDepList = groupNeedTree[modName];
      /*go through every group component (GC) and GC dependency (GCD) 
        looking for circular ref to GC's parent*/
      for(var i = 0; i < thisDepList.length; i++){
        thisDepName = thisDepList[i];
        
        if(this.detectUndeclaredGroupDependency(trgGroupName, thisDepName) == true){
          throw 'ERROR: ' + thisDepName + ' Is Undeclared Dependency Of ' + trgGroupName;
        }
        
        if(thisDepName == circularName)
          return 1;
        /*if GCD is group, we go down into that group deps and try to find refernce to ourself.
          If at any point down that rabit hole we encounter this situ, that false will propagate
          back up to us and make it impossible for this function to return a false value*/
        if(core.state['declaredGroups'].indexOf(thisDepName) > -1)
          retVal = retVal | this.detectGroupCircularDependency(thisDepName, trgGroupName);
      }
    }
    
    return retVal;
  },
  /*
  @method 
  @module dependency
  
  @return 
  */
  detectCircularDependency : function(needTree){
    var _thisDeps = null;
    var modName1 = '';
    var modName2 = '';
    var modName3 = '';
    for(var modName1 in needTree){//for Group Component (GC)

      if( this.detectGroupCircularDependency(modName1) == 1)
        throw 'ERROR: "' + modName1 + '" Is A Group With A Circular Dependency.';
        
      
      for(var i1 = 0;i1 < needTree[modName1].length; i1++){//go through it's depenedencies
        modName2 = needTree[modName1][i1];

        if( this.detectGroupCircularDependency(modName2) == 1)
         throw 'ERROR: "' + modName2 + '" Is A Group With A Circular Dependency.';
         
        if(typeof needTree[modName2] !== 'undefined'){//modName2's dependency list
          for(var i2 = 0;i2 < needTree[modName2].length; i2++){//make sure module isn't a dependency of its own dependency
            modName3 = needTree[modName2][i2];

            if(modName1 == modName3){
              throw 'ERROR: CIRCULAR DEPENDENCY: ' + modName1 + ' is a dependency of its own dependency ' + modName2;
            }
          }
        }else{
          throw 'ERROR: ' + modName2 + ' is a dependency of ' + modName1 + ' but has not been explicitly declared.';
        }
      
      }
      
    }
 
    return false;
  },
  /*This function converts our needTree into an array. The array structure is
  used through out because it is sortable. This function does the dependency
  sorting*/
  /*
  @method 
  @module dependency
  
  @return 
  */
  orderImports : function(needTree, skipCleanTLC){
    /*TODO: Check groups for circulars. Cycle through group names and run
    detectCircularDependency on their needTrees*/
    var _this = this;
    var groupsRDeps = core.state['groupsInTLC'];
    var modules = [];
    
    //convert needTree to array for easier processing
    for(var fileName in needTree){
      var modObj = {};
      modObj[fileName] = needTree[fileName];

      /*If you are a group, you have to be listed as a declared
      dependencies to remain in TLC. For group exports we need to skip this so
      if flag is present then we skip this. HORRIBLE but this function is horrible
      and breaking it up at this stage is not going to happen*/
      
      if(core.state['declaredGroups'].indexOf(fileName) > -1 && typeof skipCleanTLC == 'undefined'){
        for(var groupName in groupsRDeps){
          if(fileName == groupName)
            modules.push( modObj );
        }
      }else{
        /*If you aren't a group you get place on TLC no matter what*/
        modules.push( modObj );
      }
    }

    /*INTERNAL FUNCTIONS
     NOTE: 'this' refers to window inside these functions*/
    function getModName(modObj){
      return _this.getFilename(modObj);
    }

    this.printOrder('OrderImports: Starting Order: ', modules);
    
    function getModDeps(modName){
      return needTree[modName];
    }
    function getIndex(modName){
      for(var i = 0; i < modules.length; i++){
        if( modName === getModName( modules[i] ) )
          return i;
      }
    }
    
    function getModObj(modName){
      for(var i = 0; i < modules.length; i++){
        if( modName === getModName( modules[i] ) )
          return modules[i];
      }
    }

    function insertBefore(obj, targetIndex){
      var objIndex = getIndex( getModName(obj) );
      var targetObj = getModObj( getModName(modules[targetIndex]) );
      var targetName = getModName(modules[targetIndex]);
      //_this.pLog(2,'Moving ' + getModName(obj) + '('+objIndex+') in front of ' + targetName + '('+targetIndex+')');
      var resultArr = [];
      for(var i = 0; i <= modules.length; i++){
        if(i < targetIndex && _this.getFilename(modules[i]) != _this.getFilename(obj)){
          //_this.pLog(3,' < pushing : ' + _this.getFilename(modules[i]) + ' @ index ' + i);
          resultArr.push(modules[i]);
        }else if(i == targetIndex ){
          //_this.pLog(3,'== pushing : ' + _this.getFilename(obj) + ' @ index ' + i);
          resultArr.push(obj);
        }else if(i > targetIndex && _this.getFilename(modules[i-1]) != _this.getFilename(obj)){
          //_this.pLog(3,' > pushing : ' + _this.getFilename(modules[i-1]) + ' @ index ' + i);
          resultArr.push(modules[i-1]);
        }
      }
      modules = resultArr;
    } 
    /*END INTERNAL FUNCTIONS*/
    
    var parentIndex = 0;
    var parentName = '';
    var parentDeps = null;
    var childName = '';
    var insertPerformed = false;
    for(var i1 = 0; i1 < modules.length; i1++){
      if(insertPerformed){//have to reset at top or esle we can never set i back to 0
        i1 = ( (i1 - 2) > -1)? i1-2 : 0;//don't let i1 go negative
        insertPerformed = false;
      }
      parentName = getModName(modules[i1]);
      parentIndex = getIndex(parentName);
      parentDeps = getModDeps(parentName);
      //this.pLog(3,'Resolving: '+parentName+', Index: ' + i1);
      for(var i = 0; i < parentDeps.length; i++){
        childName = parentDeps[i];
        if(parentName === childName)
          continue;
        /*If we push dependencies in front of ourself then we need to
        set index back to make sure we run resolution on my deps or else
        we won't ever resolve my deps*/  
        if( getIndex(childName) > parentIndex){
          insertBefore( getModObj(childName), getIndex(parentName));
          insertPerformed = true;
        }
      }
    }
    this.printOrder('OrderImports: Ending Order: ', modules);
    /*FIX:iterate modules array and upon seeing an element that's an object, replace it with
          the object's key. This is to help eliminate core.resolveFileName()*/
    return modules;
  },
  orderImportsNoTLCChange : function(needTree){
    return this.orderImports(needTree, true);
  },
  /*Note the use of iteration instead of recursion. This is to reduce the memory
  footprint of the app. Recursion will create unecessary activation records whereas
  pushing back the loop index to re-evaluate indexes is an O(1) op that acheives the 
  same result*/
  /*
  @method 
  @module dependency
  
  @return 
  */
  dereferenceGroups : function(files){
    var fileName = '';
    var removeFileName = '';
    var beforeInsert = null;
    var afterInsert = null;
    var resultArray = null;
    var resolvedGroup = null;
    var groupComponents = null;
    var pushBack = 0;
    /*Resolve group chains and splice results into TLC*/
    for(var i = 0; i < files.length; i++){
      /*pushBack is used to make sure we re-evaluate previous indexes b/c
      for group refs b/c thier contents have changed. Choosing not to
      use recursion here b/c of the array insertion ops*/
      i = Math.max(0, (i - pushBack)); 
      pushBack = 0;
      
      fileName = this.getFilename(files[i]);
      
      /*We found a reference to a soft group in top-level chain (TLC)*/
      if( core.state['declaredGroups'].indexOf(fileName) > -1) {

        /*Remove Group Refs*/
        for(var i2 = 0; i2 < files.length; i2++){
          removeFileName = this.getFilename(files[i2]);

          if(removeFileName == fileName){
            //console.log('Group: '+fileName+', removing: ' + removeFileName);
            files.splice(i2, 1);
            pushBack++;
          } 
        }        

        /*this[fileName] is group object. we put it as prop of structureJS*/
        this.printOrder('Files: ',files,3);
        resolvedGroup = this.orderImports(core[fileName].state['dependencyTree']);
  
        beforeInsert = files.slice(0,(i>0)? i : 0);
        this.printOrder('Before Insert: ',beforeInsert,3);
        //console.log('i+1: ' + (i+1));
        //afterInsert = files.slice(((i+1)<files.length)?(i+1) : files.length-1, files.length);
        afterInsert = files.slice(i, files.length);
        this.printOrder('After Insert: ',afterInsert,3);

        resultArray = beforeInsert.concat(resolvedGroup);
        this.printOrder('Before Insert +  Resolved: ',resultArray,3);

        resultArray = resultArray.concat(afterInsert);
        
        this.printOrder('Final Result: ',resultArray,3);
        
        files = resultArray.slice(0, resultArray.length);
        resultArray.length = 0;
        
      }
    }
    return files;
  },
  /*
  @method 
  @module dependency
  
  @return 
  */
  resolveDependencies : function(onComplete){
    this.detectCircularDependency(core.state['dependencyTree']);
    core.state['resolvedFileList'] = this.dereferenceGroups( this.orderImports(core.state['dependencyTree']) );
    this.printOrder('Resolved Order: ', core.state['resolvedFileList']);
    core.loadModules(core.config, onComplete);
  }



};

});