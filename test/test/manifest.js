/*Data structures*/
structureJS.declare('templar/State');
structureJS.declare('templar/Util');
structureJS.declare('templar/DOM');
structureJS.declare('templar/Constants');
structureJS.declare('classes/TMP_Node');
structureJS.declare('classes/ClassModel');
structureJS.declare('templar/Map',['templar/DOM', 'templar/Util']);
/*Parse + Compile + Link _ Interpolate*/




/*Class Definitions*/
structureJS.declare('classes/Attribute.class');
structureJS.declare('classes/ClassModelSort');
structureJS.declare('classes/ClassModelPage');
structureJS.declare('classes/ClassModelFilter');
structureJS.declare('classes/Component.class');
structureJS.declare('classes/Token.class');

/*API*/
structureJS.declare('templar/Route');
structureJS.declare('templar/Templar');
structureJS.declare('templar/Process',['classes/Attribute.class', 'classes/TMP_Node']);

structureJS.declare('templar/Interpolate',['classes/TMP_Node']);
structureJS.declare('classes/ClassModelAPI',['templar/Interpolate']);
structureJS.declare('templar/Compile',['classes/TMP_Node']);
structureJS.declare('templar/Link');
/*Loading*/
structureJS.declare('templar/Bootstrap');
structureJS.declare('templar/Export');

structureJS.declare('templar/Route');
structureJS.declare('templar/System');
structureJS.declare('templar/Link');
structureJS.declare('templar/Export',['templar/System']);

/*App*/
structureJS.declare("data/Models");
structureJS.declare("App");
structureJS.declare("spec/Basic");