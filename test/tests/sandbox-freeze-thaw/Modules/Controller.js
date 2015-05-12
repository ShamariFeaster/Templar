structureJS.module('test', function(require){
  _ = this,
  A = Templar.getModel('A'),
  E = Templar.getModel('Environment');
  var a = A.a;
  a.newProp = 'blah';
  a.checked = {z : 1};
  A.attributes['__meta__'] = {};
  
  E.attributes.range.checked = {a :true, b : false};
  function freeze(mdl){
    var output = '';
    if(!_.isDef(mdl.attributes['__meta__']))
      mdl.attributes['__meta__'] = {};
    for(var attribName in mdl.attributes){
      var attrib = mdl.attributes[attribName];
      if(_.isArray(attrib)){
        for(var arrProp in attrib){
        
          if(attrib.hasOwnProperty(arrProp) && !/^-?[0-9]+$/.test(arrProp)){
             if(!_.isDef(mdl.attributes['__meta__'][attribName])){
              mdl.attributes['__meta__'][attribName] = {};
             }
             mdl.attributes['__meta__'][attribName][arrProp] = 
              (_.isString(attrib[arrProp])) ? 
                attrib[arrProp] :
                JSON.stringify(attrib[arrProp]);
          }
        }
        
      }
    }
    output = JSON.stringify(mdl.attributes);
    delete mdl.attributes['__meta__'];
    return output;
  }
  
  function thaw(jsonString, mdl){
    var thawed, thawFailed = false;
    try{
      thawed = JSON.parse(jsonString);
    }catch(e){
      thawFailed = true
    }
    
    if(thawFailed == true){
      _.log('ERROR: Frozen item was not proper JSON. Thaw failed.');
      return;
    }
    
    var meta,
      metaProp,
      thawedItem;
    
    for(var prop in thawed){
      if(prop != '__meta__')
        mdl.attributes[prop] = thawed[prop];
    }
    
    if(_.isDef(meta = thawed['__meta__'])){
      /*Reinstate meta*/
      for(var prop in meta){
        metaProp = meta[prop];
        for(var item in metaProp){
          if(_.isDef(mdl.attributes[prop])){
            try{
              thawedItem = JSON.parse(metaProp[item]);
            }catch(e){
              thawedItem = metaProp[item];
            }
            mdl.attributes[prop][item] = thawedItem;
          }
        }
        
      }
    }
    
    return mdl;
  }
  
  var frozen = E.save();
  A.a = [];
  delete E.attributes.range.checked;
  E.attributes = {};
  var thawed = E.load();
  _.log(frozen);
  _.log(thawed);
});