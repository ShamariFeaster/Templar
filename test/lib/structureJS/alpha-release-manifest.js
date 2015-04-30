/*Data*/
structureJS.declare('modules/Data/Config');
structureJS.declare('js/GeoInfo');
structureJS.declare('modules/Data/Type-Category-Map');

/*App*/
structureJS.declare('modules/Auth', ['modules/Helper']);
structureJS.declare('modules/Routes');
structureJS.declare('modules/Model');
structureJS.declare('modules/Helper', ['modules/Model','js/JRDBI']);
structureJS.declare('modules/Controller');
structureJS.declare('js/JRDBI', ['modules/Data/Config']);

/*Components*/
structureJS.declare('components/Attributes');
structureJS.declare('components/Row');
structureJS.declare('components/Column');
structureJS.declare('components/OverlayButton');
structureJS.declare('components/PageButton');
structureJS.declare('components/LimitSelect');

/*Controller Mixins*/
structureJS.declare('controllers/ControllerMixins/NewAd.mixin');
structureJS.declare('controllers/ControllerMixins/MyAds.mixin');

/*Home*/
structureJS.declare('controllers/NavigationController');
structureJS.declare('controllers/LoginController');

/*Profile*/
structureJS.declare('controllers/EditProfileController');
structureJS.declare('controllers/MyProfileController');

/* My Ads */
structureJS.declare('controllers/MyAds/MyAdsController');

/* Show Ad */
structureJS.declare('controllers/AdController');
structureJS.declare('controllers/MyAds/EditAdController', ['controllers/AdController','controllers/NewAd/categorySelectController']);
structureJS.declare('controllers/MetaSidebar/MetaSidebarController');
/*New Ad*/
structureJS.declare('controllers/NewAd/previewController');
structureJS.declare('controllers/NewAd/categorySelectController');
structureJS.declare('controllers/NewAd/titleDescriptionController');
structureJS.declare('controllers/NewAd/typeFormController');

/*Type Specific Forms*/
structureJS.declare('controllers/AdForms/AnnouncementCtrl');
structureJS.declare('controllers/AdForms/ForSaleCtrl');
structureJS.declare('controllers/AdForms/HousingCtrl');
structureJS.declare('controllers/AdForms/JobsCtrl');
structureJS.declare('controllers/AdForms/PersonalsCtrl');
structureJS.declare('controllers/AdForms/ServicesCtrl');

/* Search Ad */
structureJS.declare('controllers/SearchAds/SearchAdController', ['controllers/MetaSidebar/MetaSidebarController']);