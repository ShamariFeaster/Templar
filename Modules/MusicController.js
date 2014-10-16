structureJS.module('MusicCotroller', function(require){

  var Templar = require('Templar');

  Templar.success('partial-login-screen.html', function(){
    console.log('Music Onload Fired');

    var audioplayers = Templar('audioPlayer');

    /*Put listener on control children*/
    audioplayers.listenTo('play').forEvent('click', function(e, index){
      console.log('Play Click ' + index + ' '  + e.player.node.src);
      console.log(e);
      e.player.node.play();
      //e.next.hide();
    });
    
    audioplayers.listenTo('pause').forEvent('click', function(e, index){
      console.log('Pause Click ' + index);
      e.player.node.pause();
      //e.next.show();
    });
    
  });
  
  return {};
});