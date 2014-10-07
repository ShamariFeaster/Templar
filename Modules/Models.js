Templar = structureJS.require('Templar');

Templar.dataModel('Environment',
            {
              /*Base page */
              siteName :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              
              /*Page Clock*/
              time : ''
            });

Templar.dataModel('Login',
            {
              /*Text data*/
              banner :  'Welcome To NiteWork',
              url : '/login.html',
              
              /*Inputs*/
              userInput : 'Type Here',
              
              /*Drop down data*/
              countries :  [{text : 'CAN', value : 1},
                        {text : 'MEX', value : 2},
                        {text : 'US', value : 3, selected : true}],
              
                        
              US_states : [{text : 'Alabama', value : 1},
                        {text : 'Arkansas', value : 2}],
                        
              CAN_states : [{text : 'BC', value : 1},
                        {text : 'Ontario', value : 2, selected : true},
                        {text : 'Calgary', value : 3}],
                        
              selected : 'Nothing Yet',
              
              /*Repeated Data*/
              items : [{title : 'Baseball Cards', price : '$1.00', color : 'blue' },
                       {title : 'Fishing Rod', price : '$35', color : 'red'}],
              list : ['apples', 'bananas', 'carrots'],
              
            });