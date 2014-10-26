structureJS.module('CommentCotroller', function(require){

  var Templar = require('Templar'),
      CommentsModel = Templar.getModel('Comments');
  
  /*Itial page limit*/
  CommentsModel.limit('comments').to(3);
  CommentsModel.currentPage = CommentsModel.currentPageOf('comments');  
  CommentsModel.totalPages = CommentsModel.totalPagesOf('comments');
  
  Templar.Route([{
    route : '#/comment/show/Comments:selectedComment',
    partial : 'partial-show-comment.html',
    target : '#single-nitework'
  
  }]);
  
  Templar.success('partial-login-screen.html', function(){
    console.log('Comment Onload Fired');
    CommentsModel.resetLiveFiltersOf('comments');
    
    /*Listen to select changes*/
    CommentsModel.listen('limits', function(e){
      CommentsModel.limit('comments').to(e.value);
      CommentsModel.update('comments');
      CommentsModel.totalPages = CommentsModel.totalPagesOf('comments');
    });
    
    CommentsModel.listen('searchBy', function(e){
      CommentsModel
        .filter('comments')
        .by(e.value)
        .using('searchInput');
    });
    
    CommentsModel.listen('searchBy', function(e){
      CommentsModel
        .filter('comments')
        .by(e.value)
        .using('searchInput');
    });
    
    CommentsModel.listen('orderBy', function(e){
      CommentsModel
        .sortCurrentPageOf('comments')
        .orderBy(e.value);
      CommentsModel.update('comments');
    });
    
    /*Pagination*/
    Templar('prev').listen('click', function(){
      CommentsModel.gotoPreviousPageOf('comments');
      CommentsModel.currentPage = CommentsModel.currentPageOf('comments');  
    });
    
    Templar('next').listen('click', function(){
      CommentsModel.gotoNextPageOf('comments');
      CommentsModel.currentPage = CommentsModel.currentPageOf('comments');  
    });
    
    
  });
  
  return {};
});