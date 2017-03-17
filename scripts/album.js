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
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            //            $(this).html(playButtonTemplate);
            //            $('.main-controls .play-pause').html(playerBarPlayButton);
            //            //set song to null ?
            // setSong(songNumber);
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                setSong(songNumber);
                currentSoundFile.play();
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
        var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var trackIndex = function (album, song) {
    return album.songs.indexOf(song);
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
    updatePlayerBarSong();

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};


var updatePlayerBarSong = function () {
    $('.song-name').text(currentSongFromAlbum.name);
    $('.artist-name').text(currentAlbum.artist);
    $('.artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};



$(document).ready(function () {
    setCurrentAlbum(albumPicasso);

    $nextButton.click(nextSong);
    $previousButton.click(previousSong);
});
