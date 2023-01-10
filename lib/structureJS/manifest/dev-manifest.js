/*Data structures*/
structureJS.declare('templar/State');
structureJS.declare('classes/TMP_Node');
structureJS.declare('templar/Constants');

structureJS.declare('templar/Map', ['templar/Constants', 'classes/TMP_Node']);
/*Parse + Compile + Link _ Interpolate*/
structureJS.declare('templar/Process',['classes/Attribute.class', 'classes/TMP_Node']);
structureJS.declare('templar/Interpolate',['classes/TMP_Node']);
structureJS.declare('templar/Compile',['classes/TMP_Node','classes/Token.class']);

structureJS.declare('classes/ClassModelSort');
structureJS.declare('classes/ClassModelPage');
structureJS.declare('classes/ClassModelFilter');
structureJS.declare('classes/ClassModelAPI');



structureJS.declare('templar/Link');
/*Class Definitions*/
structureJS.declare('classes/Attribute.class');
structureJS.declare('classes/ClassModelSort');
structureJS.declare('classes/ClassModelPage');
structureJS.declare('classes/ClassModelFilter');
structureJS.declare('classes/ClassModelAPI');
structureJS.declare('classes/Component.class');
structureJS.declare('classes/Token.class');
/*API*/
structureJS.declare('templar/Route');
structureJS.declare('templar/Templar');
structureJS.declare('templar/Link');
/*Loading*/
structureJS.declare('templar/Bootstrap');
structureJS.declare('templar/Export');

structureJS.declare('templar/Route');
structureJS.declare('templar/System');
structureJS.declare('templar/Export');

/*App*/

structureJS.declare('App');