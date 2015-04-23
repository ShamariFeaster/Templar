structureJS.module('MetaSidebarController', function(require){
  var mixin = (function(){

    function fetchMeta(uid){
      var _this = this;
      
      this.SelectQuery
        .fields({profile_pic_uri: true})
        .condition(this.JRDBI.Condition.EQ('uid',uid))
        .execute('people', function(data){
          _this.mdl.creatorImageSrc = 
            _this.cfg.ppPicDir + data.results[0].profile_pic_uri;
        });
    }
    
    
    /* Constructor */
    return function(){
      var _this = this;
      this.mdl = window.Templar.getModel('AdMetadata');
      this.JRDBI = window.structureJS.require('JRDBI');
      this.SelectQuery = new this.JRDBI.QueryCollection.Select();
      this.EQ = 
      this.cfg = window.structureJS.require('Config');
      this._super = {};
      this.fetchMeta = fetchMeta;
      return this;
    };
  })();

  return require('Controller')( mixin );
});