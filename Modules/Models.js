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
              userInput : 'Type Here',
              
              /*Drop down data*/
              countries :  [{text : 'CAN', value : 1, test : 'blah'},
                        {text : 'MEX', value : 2, test : 'oh nooze'},
                        {text : 'US', value : 3, selected : true}],
              
                        
              US_states : [{text : 'Alabama', value : 1},
                        {text : 'Arkansas', value : 2}],
                        
              CAN_states : [{text : 'BC', value : 1},
                        {text : 'Ontario', value : 2, selected : true},
                        {text : 'Calgary', value : 3}],
              
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
                      
              numbers : [2,7,4,8,-24,-74,11,-6,-29,66,43]
              
            });