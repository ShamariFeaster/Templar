//Custom Attribute
Templar.attribute('showIf',{
    onChange : function(self, val){
        if(val === true || val == 'true' || parseInt(val) > 0){
            self.style.display = '';
        }else{
            self.style.display = 'none';
        }
    }
});

//movieJSON from movieDB.js
var categories = {};

movieJSON.forEach(function(movieItem){
    var genreList = movieItem.genre.split(' ');
    var genreStr = 'unknown';
    if(genreList.length > 1){
        genreList.sort();
        genreStr = genreList.join('-');
    }
    else if(genreList.length == 1 && genreList[0]?.length > 0){
        genreStr = genreList[0];
    }
    
    movieItem.Title = movieItem.Title.toUpperCase();
    categories[genreStr] = true;
  
    movieItem.genre = genreStr;
    movieItem.searchStr = movieItem.Title + ' ' + genreStr;
    var linkString = encodeURI(`site:https://en.wikipedia.org/ "${movieItem.Title}" (film)`);
    movieItem.searchLink = `https://google.com/search?q=${linkString}`;
});

Templar.dataModel('Movies',{
  movieList : movieJSON,
  searchInput : '',
  searchResultCount : 0,
  genreList : Object.keys(categories)
});

var Movies = Templar.getModel('Movies');

Movies.filter('movieList').using('searchInput').and((input, item)=>{
    //look for input against movie search string, case-insensitive
    return (new RegExp(input, 'i').test(item.searchStr));
});

Movies.listen('searchInput', function(e){
    //results from live filter
    //TODO: make public interface to this var
    let len = Movies.cachedResults.movieList?.length;
    //BUG: setting attrib to something undefined causes issue
    //where templar won't interpolate attrib
    //remove ternary below to reproduce
    len = (len) ? len : 0;
    Movies.searchResultCount = len;
});

Templar.done(function(){
    
    Movies.sort('movieList').orderBy('Title');
    Movies.sort('genreList');
    Movies.update('genreList');
    Movies.update('movieList');
    
    $('.category-btn').on('click', function(e){
        //e.target is templar-generated span
        Movies.searchInput = e.target.innerText;
        //make non-selected black and regular sized
        $('.category-btn').css('color', 'black');
        $('.category-btn').css('font-size', '21px');
        //make selected bigger and blue
        $(this).css('color', 'blue');
        $(this).css('font-size', '27px');
        Movies.sort('movieList').orderBy('Title');

        
    });

    $('#clear').on('click', function(e){
        Movies.searchInput = '';
        Movies.searchResultCount = 0;
        $('.category-btn').css('color', 'black');
        $('.category-btn').css('font-size', '21px');
        Movies.sort('movieList').orderBy('Title');

    });

    
});

