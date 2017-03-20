var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var currentVolume = 80;
var currentlyPlayingSongNumber = null;
var currentAlbum = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var $nextButton = $('.main-controls .next');
var $previousButton = $('.main-controls .previous');





var setSong = function (songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    // instantiate buzz sound object
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
};


var seek = function (time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function (volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}


var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">' +
        '     <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
        '     <td class="song-item-title">' + songName + '</td>' +
        '     <td class="song-item-duration">' + songLength + '</td>' +
        ' </tr>';
    var $row = $(template);



    var clickHandler = function () {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber)
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();

            updateSeekBarWhileSongPlays();
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({ left: currentVolume + '%'});
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {

            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                setSong(songNumber);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays()
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }


        }
    };







    var onHover = function (event) {

        var songNumLocation = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumLocation.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumLocation.html(playButtonTemplate);
        }

    };

    var offHover = function (event) {

        var songNumLocation = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumLocation.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumLocation.html(songNumber);
        }

    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;

};


var setCurrentAlbum = function (album) {

    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.name);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var trackIndex = function (album, song) {
    return album.songs.indexOf(song);
};

var updateSeekBarWhileSongPlays = function () {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function (event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerbar();
            setTotalTimeInPlayerBar();
        });
    }
};


var setTotalTimeInPlayerBar = function() {
    var totalTime = buzz.toTimer(currentSoundFile.getDuration());
    $('.total-time').html(totalTime);
    
}
var setCurrentTimeInPlayerbar = function (){
   
   var currentTime = buzz.toTimer(currentSoundFile.getTime());
    $('.current-time').html(currentTime); 
   
};

//updates the seek bars 
var updateSeekPercentage = function ($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({
        left: percentageString
    });
};

//determine the seek bar ratio

var setupSeekBars = function () {

    //get all elements with the class of seek-bar contained in the class of player bar
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function (event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }


        updateSeekPercentage($(this), seekBarFillRatio);
    });
    // get the class of thumb in the seekbars jquery object.  Add event listener
    $seekBars.find('.thumb').mousedown(function (event) {
        // in the context of this event we access the parent of what was clicked
        var $seekBar = $(this).parent();

        // #9
        $(document).bind('mousemove.thumb', function (event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        // #10
        $(document).bind('mouseup.thumb', function () {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};


var nextSong = function () {

    var getLastSongNumber = function (index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};

var previousSong = function () {

    var getLastSongNumber = function (index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};




var updatePlayerBarSong = function () {
    $('.song-title').text(currentSongFromAlbum.title);
    $('.artist-name').text(currentAlbum.artist);
    $('.artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};



$(document).ready(function () {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();

    $nextButton.click(nextSong);
    $previousButton.click(previousSong);
});
