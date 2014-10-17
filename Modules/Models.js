Templar = structureJS.require('Templar');

Templar.dataModel('Environment',
            {
              /*Base page */
              siteName :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              
              /*Page Clock*/
              time : '',
              
              image_templar : 'images/Cross_Templar.svg'
            });
Templar.dataModel('Music',{
  songs : [{src : 'media/prototype.mp3' , title : 'OutKast - Prototype'}, 
                      { src : 'media/sleep.mp3', title : 'Roots - Sleep'}]
});

Templar.dataModel('Comments',{
  comments : [{fn : 'susan', ln : 'apples' ,comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'susan', ln : 'knotts' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'tom', ln : 'essien' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'tom', ln : 'feaster' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'tom', ln : 'hyatt' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jerry', ln : 'brown' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jerry', ln : 'cundiff' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jerry', ln : 'jones' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'billy', ln : 'flacco' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'john', ln : 'manziel' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jeffery', ln : 'watt' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jeffery', ln : 'manning' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'westley', ln : 'dolton' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'westley', ln : 'crusher' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'},
                          {fn : 'jim', ln : 'brown' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'}],
  totalPages : [],
  currentPage : '',
  /*Inputs*/
  searchInput : '',
  
  /*Drop down data*/
  orderBy :  [{text : 'First Name', value : 'fn', selected : true},
            {text : 'Last Name', value : 'ln'}],
  
            
  limits : [{text : '3', value : 3, selected : true},
            {text : '5', value : 5},
            {text : '7', value : 7}],
            
  searchBy : [{text : 'First Name', value : 'fn'},
            {text : 'Last Name', value : 'ln', selected : true}]
});

