//movieJSON from movieDB.js

Templar.dataModel('Movies',{
  movieList : movieJSON,
  searchInput : ''
});


var Movies = Templar.getModel('Movies');
  
Movies.filter('movieList').using('searchInput').and((input, item)=>{
    //look for input against movie search string, cse-insensitive
    return (new RegExp(input, 'i').test(item.searchStr));
});

Templar.done(function(){
    
    $('.category-btn').on('click', function(e){
        Movies.searchInput = e.target.innerText;
        $('.category-btn').css('color', 'black');
        $('.category-btn').css('font-size', '21px');
        e.target.style.color = 'blue';
        $(e.target).css('font-size', '27px');
    });
    
    $('#clear').on('click', function(e){
        Movies.searchInput = '';
        $('.category-btn').css('color', 'black');
        $('.category-btn').css('font-size', '21px');
    });
    
});
