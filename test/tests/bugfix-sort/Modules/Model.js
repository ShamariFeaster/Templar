Templar = structureJS.require('Templar');

Templar.dataModel('Environment',
            {
              /*Base page */
              siteName :  'Nitework',
              footer : 'Footer',
              host : 'http://nitework.com',
              
              /*Page Clock*/
              time : '',
              range : [1,2,3],
              test : [{uno : 'value1'},{uno : 'value2'}],
              image_templar : 'images/Cross_Templar.svg',
              selects : [[1,2,3,], { test : [4,5,6]}],
              cb : [1,2,3],
              complex_repeat : [
                {title : 'hello world', 
                author : 'Shamari Feaster', 
                other_books : ['fruit','basket','days']
                },
                {title : 'I love u', 
                author : 'Roxanne Feaster', 
                other_books : ['uno','dos','tres']
                }]
            });
Templar.dataModel('A',
            {a : [
            {date : 20160304, title : 'b'},
            {date : 20160304, title : 'a'},
            {date : 20150304, title : 'fart2'},
            {date : 20150304, title : 'a'},
            {date : 20150305, title : 'fart'}
            ]});