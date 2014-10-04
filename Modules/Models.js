Templar = structureJS.require('Templar');

Templar.dataModel('Env',
            {
              title :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              color : 'green'
            });

Templar.dataModel('Images',{frontPage :  {src : 'blah.img'}});

Templar.dataModel('Auth',
            {
              banner :  'Welcome To NiteWork',
              userName : 'User Names',
              url : '/pages.html',
              select :  [{text : 'Item 1', value : 1},
                        {text : 'Item 2', value : 2, selected : true},
                        {text : 'Item 3', value : 3}],
              select1 : [{text : 'Brought To You By', value : 1},
                        {text : 'Terror Dome Productions', value : 2}],
              select2 : [{text : 'Item 1', value : 1},
                        {text : 'Item 2', value : 2, selected : true},
                        {text : 'Item 3', value : 3}],
              selected : 'Nothing Yet',
              items : [{title : 'Baseball Cards', price : '$1.00', color : 'blue' },
                       {title : 'Fishing Rod', price : '$35', color : 'red'}],
              list : ['blah', 'blah2', 'blah3'],
              
            });