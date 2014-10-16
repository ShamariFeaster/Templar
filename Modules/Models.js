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

Templar.dataModel('Login',
            {
              /*Text data*/
              banner :  'Welcome To NiteWork',
              url : '/login.html',
              
              /*Inputs*/
              userInput : '',
              
              /*Drop down data*/
              orderBy :  [{text : 'First Name', value : 'fn', selected : true},
                        {text : 'Last Name', value : 'ln'}],
              
                        
              limits : [{text : '3', value : 3, selected : true},
                        {text : '5', value : 5},
                        {text : '7', value : 7}],
                        
              searchBy : [{text : 'First Name', value : 'fn'},
                        {text : 'Last Name', value : 'ln', selected : true}],
              
              MEX_states : [{text : 'Juarez', value : 1},
                        {text : 'Oxiaca', value : 2, selected : true},
                        {text : 'Sinola', value : 3}],
                        
              selected : 'Nothing Yet',
              
              /*Repeated Data*/
              items : [{title : 'Doo Doo', price : '100', color : 'blue' },
                       {title : 'Peanuts', price : '35', color : 'red'},
                       {title : 'Doo Doo', price : '5', color : 'red'},
                       {title : 'Doo Doo', price : '15', color : 'blue'},
                       {title : 'Peas', price : '32', color : 'blue'},
                       {title : 'Peas', price : '42', color : 'red'},
                       {title : 'Peas', price : '2', color : 'blue'},
                       {title : 'Donald Duck', price : '12', color : 'green'},
                       {title : 'Peanuts', price : '25', color : 'green'}],
              list : ['apples', 'Peanuts', 'clams', 'carrots','donuts','eggplants','fish','grapes',
                      'gordos','hot dogs','krack'],
                      
              numbers : [2,7,4,8,-24,-74,11,-6,-29,66,43],
              
              songs : [{src : 'media/prototype.mp3' , title : 'OutKast - Prototype'}, 
                      { src : 'media/sleep.mp3', title : 'Roots - Sleep'}],
                      
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
                          {fn : 'jim', ln : 'brown' , comment : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt vulputate quam at euismod. Curabitur vel ante eros. Praesent purus eros, viverra a fermentum quis, pretium vitae metus. Mauris egestas ex nec neque maximus, in mollis lacus dictum.'}]
              
            });