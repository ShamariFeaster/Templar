/*
templar app has to go here because templar is loaded dynamically
via structureJS and to ensure lib is fully loaded before accessing templar
interface, we must use structureJS to ensure dependency order
*/

Templar.dataModel('a', {
    a : 'hello world'
});