structureJS.module('Type-Category-Map', function(require){
var AdTypes = 
['For Sale', 'Jobs', 'Housing', 'Services', 'Personals', 'Announcements'];
var PersonEntities = 
['Man','Woman','Couple','TG/TS/TV','Group of Men', 'Group of Women'];

var Categories = {};
Categories[AdTypes[0]] = 
['Antiques','Appliances','Arts & Crafts','Atv, Utv, Snowmobile','Auto Parts','Kid/Baby',
'Barter','Bicycles','Boats','Books','B2B','Autos','CD/DVD/VHS','Cell Phones','Clothing',
'Collectibles','Computers','Electronics','Farm & Garden','Free','Furniture','Health/Beauty',
'Heavy Equipment','Household','Jewelry','Materials','Motorcycles','Musical Instruments',
'Photo/Video','RVs','Sporting Goods','Tickets','Tools','Toys & Games','Video Gaming'];
Categories[AdTypes[1]] = 
['accounting/finance','admin/office','architect/engineer/cad','art/media/design','business/mgmt',
'customer service','education/teaching','food/beverage/hospitality','general labor','government',
'healthcare','human resource','internet engineering','legal/paralegal','manufacturing',
'marketing/advertising/pr','nonprofit','real estate','retail/wholesale','sales','salon/spa/fitness',
'science/biotech','security','skilled trades/artisan','software/qa/dba/etc','systems/networking',
'technical support','transportation','tv/film/video/radio','web/html/info design','writing/editing'];
Categories[AdTypes[2]] = 
['Apartments','Rooms','Houses','Commercial','Parking/Stroage','Land','Vaction Renatls','Sublets'];
Categories[AdTypes[3]] = 
['automotive services','beauty services','computer services','creative services','cycle services',
'event services','farm & garden services','financial services','household services','labor & moving',
'legal services','lessons & tutoring','marine services','pet services','real estate services',
'skilled trade services','small biz ads','therapeutic services','travel/vacation services','writing/editing/translation'];
Categories[AdTypes[4]] = 
['Missed Connection','Platonic','Long Term','Booty Calls'];
Categories[AdTypes[5]] = 
['Political','Garage Sale','General'];

return {
  AdTypes : AdTypes,
  Categories : Categories,
  PersonEntities : PersonEntities  
};

});