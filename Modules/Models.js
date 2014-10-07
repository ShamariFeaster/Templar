Templar = structureJS.require('Templar');

Templar.dataModel('Env',
            {
              title :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              color : 'green'
            });

Templar.dataModel('Buttons',
            {
              switch_url1 :  'Switch URL 1',
              switch_url2 : 'Switch URL 2',
              update_footer : 'Update Footer'
            });
            
Templar.dataModel('Images',{frontPage :  {src : 'blah.img'}});

Templar.dataModel('Auth',
            {
              banner :  'Welcome To NiteWork',
              userName : 'User Names',
              url : '/pages.html',
              countries :  [{text : 'CAN', value : 1},
                        {text : 'MEX', value : 2},
                        {text : 'US', value : 3, selected : true}],
                        
              states : [{text : 'Alabama', value : 1},
                        {text : 'Arkansas', value : 2}],
                        
              CAN_states : [{text : 'BC', value : 1},
                        {text : 'Ontario', value : 2, selected : true},
                        {text : 'Calgary', value : 3}],
                        
              selected : 'Nothing Yet',
              items : [{title : 'Baseball Cards', price : '$1.00', color : 'blue' },
                       {title : 'Fishing Rod', price : '$35', color : 'red'}],
              list : ['apples', 'bananas', 'carrots'],
              
            });