Templar.dataModel('Example',{

    SimpleRepeat : ['a','b','c'],
    
    ComplexRepeat : [
    {fn : 'bob', ln : 'johnson'},
    {fn : 'michael', ln : 'jackson'},
    {fn : 'benadict', ln : 'cabbagepatch'}],
    
    EmbeddedRepeat : [
    {name : 'daryl', friends : ['bill','tommy']},
    {name : 'carl', friends : ['susan','sicky']},
    {name : 'rick', friends : ['jane','tammy']}],
    
    SimpleSelect : [1,2,3],
    ComplexSelect : [
    {text : 'uno', value : 1},
    {text : 'dos', value : 2},
    {text : 'tres', value : 3}],
    
    aString : 'Hello World',
    numbers : [1,2,3],
    pageDemo : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    numbers : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    objects : [
    {text : 'uno', value : '1'},
    {text : 'dos', value : '2'},
    {text : 'tres', value : '3'}],
    
    biologyTaxonomyData : [
    {Kingdom : 'animalia', Class : 'mammalia', Species : 'dog'},
    {Kingdom : 'animalia', Class : 'mammalia', Species : 'cat'},  
    {Kingdom : 'animalia', Class : 'mammalia', Species : 'human'},
    {Kingdom : 'animalia', Class : 'arthropod', Species : 'crab'}, 
    {Kingdom : 'animalia', Class : 'arthropod', Species : 'butterfly'},
    {Kingdom : 'plantae', Class : 'monocots', Species : 'corn'}, 
    {Kingdom : 'plantae', Class : 'monocots', Species : 'wheat'},
    {Kingdom : 'plantae', Class : 'monocots', Species : 'rice'}, 
    {Kingdom : 'plantae', Class : 'magnoliopsida ', Species : 'oak'},
    {Kingdom : 'plantae', Class : 'magnoliopsida', Species : 'sunflower'},
    {Kingdom : 'plantae', Class : 'magnoliopsida', Species : 'rose'}            
    ],
    biologyTaxonomyColumns : ['Kingdom','Class','Species']
    
});

Templar.dataModel('Taxonomy',{
  data : [
  {Kingdom : 'animalia', Class : 'mammalia', Species : 'dog'},
  {Kingdom : 'animalia', Class : 'mammalia', Species : 'cat'},  
  {Kingdom : 'animalia', Class : 'mammalia', Species : 'human'},
  {Kingdom : 'animalia', Class : 'arthropod', Species : 'crab'}, 
  {Kingdom : 'animalia', Class : 'arthropod', Species : 'butterfly'},
  {Kingdom : 'plantae', Class : 'monocots', Species : 'corn'}, 
  {Kingdom : 'plantae', Class : 'monocots', Species : 'wheat'},
  {Kingdom : 'plantae', Class : 'monocots', Species : 'rice'}, 
  {Kingdom : 'plantae', Class : 'magnoliopsida ', Species : 'oak'},
  {Kingdom : 'plantae', Class : 'magnoliopsida', Species : 'sunflower'},
  {Kingdom : 'plantae', Class : 'magnoliopsida', Species : 'rose'}            
  ],
  columns : ['Kingdom','Class','Species']
});

Templar.dataModel('Helper',{
  aStringNT : '{{Example.aString}}',
  userName : '{{UserProfile.userProfile}}',
  signedIn : '{{DataModelName.isSignedIn}}',
  listLength : '{{DataModelName.someList.length}}',
  items : '{{TodoList.items}}',
  pageDemo : '{{Exmaple.pageDemo}}',
  pageDemoLimit : '{{Exmaple.pageDemo.limit}}',
  pageDemoPage : '{{Exmaple.pageDemo.page}}',
  pageDemoTotal : '{{Exmaple.pageDemo.totalPages}}'
});