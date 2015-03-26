structureJS.module('Constants', function(require){
  _ = Object.create(null);
  
  _.MODEL_ATTRIB_KEY = 'aplAttrib';
  _.MODEL_ATTRIB_REPEAT_KEY = 'aplRepeat';
  _.TARGET_ATTRIB_KEY = 'aplTarget';
  _.CTRL_KEY = 'aplControl';
  _.CTRL_ATTRIB_STRING = 'data-apl-control';
  
  _.IE_MODEL_ATTRIB_KEY = 'apl-attrib';
  _.IE_MODEL_REPEAT_KEY = 'apl-repeat';
  _.IE_TARGET_ATTRIB_KEY = 'apl-target';
  _.IE_CTRL_ATTRIB_KEY = 'apl-control';
  _.IE_DEFAULT_ATTRIB_KEY = 'apl-default';
  _.CLASS_SEPARATOR = /,|\s/;
  _.NT_REGEX = /\w\:\w/;
  _.RX_TOKEN = /\{\{(\w+\.\w+)(.*)*/;
  _.RX_ALL_INX = /(\{\{(\w+\.\w+)([^}]*)*\}\})+?/g;

  _.RX_M_ATTR = /\{\{(\w+)\.(\w+)([^}]*)*/g;
  _.RX_M_ATTR_TOK = /\{\{(\w+)\.(\w+)(?:[^"'>\n\t\w]*)*/g;
  _.RX_IDX_ITER = /\[(\w+|\d+)\]|\.(\w+)/g;
  _.RX_ANNOT = /%(\w+)%([^%]+)%\/(?:\w+)%/g
  /*Repeat Regex*/
  _.RX_RPT_M_ATTR = /(\w+\.\w+)(.*)*/g;
  _.RX_RPT_ALL_INX = /((\w+\.\w+)([^}]*)*)/g;
  _.TEXT_NODE = 3;
  _.ELEMENT_NODE = 1;
  _.UNINDEXED = -1;
  _.NON_TERMINAL = 0;
  _.TERMINAL = 1;
  _.STACK = 0; 
  _.QUEUE = 1;
  _.COMPILE_ME = 1;
  _.NO_COMPILE_ME = 0;
  _.RECOMPILE_ME = -1;
  _.SYSTEM_EVENT_TYPES = { system : 'TMP_SYSTEM', 
                           interpolation_done : 'interp_done',
                           link_done : 'interp_done',
                           repeat_built : 'repeat_built',
                           framework_loaded : 'fw_loaded',
                           LIST_TYPE : _.QUEUE};
  _.MODEL_EVENT_TYPES = {
    interp_change : 'i_change',
    select_change : 's_change',
    checkbox_change : 'cb_change'
  };
  
  _.RESTRICTED = 'RESTRICTED';
  structureJS.extendContext(_); 
});