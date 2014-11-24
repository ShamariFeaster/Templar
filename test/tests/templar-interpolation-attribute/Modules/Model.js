Templar = structureJS.require('Templar');

Templar.dataModel('Environment',
            {
              /*Base page */
              siteName :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              
              /*Page Clock*/
              time : '10:00am',
              
              image_templar : 'images/Cross_Templar.svg'
            });
Templar.dataModel('Music',{
  songs : [{src : 'media/prototype.mp3' , title : 'OutKast - Prototype'}, 
                      { src : 'media/sleep.mp3', title : 'Roots - Sleep'}]
});
Templar.dataModel('Attributes',{
  title : 'title-demo',
  name : 'attrib-name',
  _class : 'test-class',
  style : 'border : 1px solid black;',
  data_test : 'data test',
  id : 'test-id',
  expected_result_style : '{{Attributes.style}}',
  expected_result_class : '{{Attributes._class}}',
  non_scalar : [
                {text : 'Test uno', value : 3},
                {text : 'Test dos', value : 5},
                {text : 'Test tres', value : 7}],
  range : [0,1,2]
});

Templar.dataModel('Comments',{
  comments : [{id : 1,fn : 'susan', ln : 'apples' ,comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 2,fn : 'susan', ln : 'knotts' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 3,fn : 'tom', ln : 'essien' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 4,fn : 'tom', ln : 'feaster' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 5,fn : 'tom', ln : 'hyatt' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 6,fn : 'jerry', ln : 'brown' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 7,fn : 'jerry', ln : 'cundiff' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 8,fn : 'jerry', ln : 'jones' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 9,fn : 'billy', ln : 'flacco' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 10,fn : 'john', ln : 'manziel' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 11,fn : 'jeffery', ln : 'watt' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 12,fn : 'jeffery', ln : 'manning' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 13,fn : 'westley', ln : 'dolton' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 14,fn : 'westley', ln : 'crusher' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
              {id : 15,fn : 'jim', ln : 'brown' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'}],
  totalPages : [],
  currentPage : '',
  /*Inputs*/
  searchInput : '',
  selectedComment : 10,
  /*Drop down data*/
  orderBy :  [{text : 'First Name', value : 'fn', selected : true},
            {text : 'Last Name', value : 'ln'}],
  
            
  limits : [{text : '3', value : 3},
            {text : '5', value : 5},
            {text : '7', value : 7, selected : true}],
            
  searchBy : [{text : 'First Name', value : 'fn'},
            {text : 'Last Name', value : 'ln', selected : true}],
  range : [0,1,2,3,4,5,6,7,8,9,10]
});

