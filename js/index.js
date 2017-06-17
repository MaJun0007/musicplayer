(function(){
    /**********Loading*********/
    var Loading=function (ele,imgData){
        this.ele=$(ele);
        this.loading_percent=this.ele.find('.loading-percent');
        this.imgData=imgData;
        this.init();
    }
    Loading.prototype={
        constructor:Loading,
        init:function (){
            this.loadImages();
        },
        loadImages:function (){
            var loading=this;
            if (typeof this.images === 'undefined') {
                this.imagesCount=(this.imgData||[]).length;
                this.loadedImags=0;
                for (var key in this.imgData) {
                    var image=new Image();
                    image.src=this.imgData[key];
                    image.onload=function (){
                        loading.showPercent();
                    }
                }
                this.loading_percent.text('0%');
            }
        },
        showPercent:function (){
            this.loadedImags++;
            this.loading_percent.text((this.loadedImags/this.imagesCount*100>>0)+'%');
            if (this.loadedImags<this.imagesCount) {
                return;
            }
            this.ele.fadeOut(function (){
                music_listPage.init();
                music_detailPage.init();
            });
        }
    }
    window.Loading=Loading;
    /************************/
    var scroll;
    var $list_item;
    var $music_detailPage=$('.music-detailPage');
    var $lyric_list=$music_detailPage.find('.lyric-list');
    var lastList_itemIndex;
    var $audio_control=$('.audio-control');
    var $audio=$('.music-player')[0];
    var $audioState='pause';
    var CurrentMusicNumber=0;
    var NextMusicNumber=0;
    var $current_time;
    var $progress_line;
    var $bar;
    var $total_time;
    var $playBtn;
    /**********music-listPage*********/
    var music_listPage=(function (){
        var $music_listPage=$('.music-listPage');
        var $listPage_listWrapper=$music_listPage.find('.listPage-listWrapper');
        var $listPage_list=$listPage_listWrapper.find('.listPage-list');
        var $list_player =$music_listPage.find('.list-player');
        var isTouchMove=false;
        var canSlide=false;
        function MusicList_ByGET(){
            $.ajax({
                url:'data/music_list.json',
                type:'GET',
                dataType:'json',
                success:function (data){
                    $.each(data,function (index,value){
                        var li=$('<li class="list-item" data-id="'+value.id+'"><h2 class="music-name">'+value.musicName+'</h2><p class="singer">'+value.name+'</p></li>')
                        $listPage_list.append(li);
                    });
                    $list_item=$listPage_list.find('.list-item');
                    lastList_itemIndex=$list_item.last().index()+1;
                    scroll=new BScroll($listPage_listWrapper[0],{
                        click: true,
                        bounceTime:1000,
                        probeType: 3
                    });
                    scroll.on('scrollStart',function (){
                        isTouchMove=true;
                    });
                    scroll.on('touchend',function (){
                        isTouchMove=false;
                    });
                }
            })
        }
        function bindFunctions(){
            $listPage_list.delegate('li','touchend',function (){
                if (!isTouchMove) {
                    $(this).addClass('active').siblings().removeClass('active');
                    CurrentMusicNumber=$(this).data('id');
                    music_detailPage.loadMusicInfo(CurrentMusicNumber);
                }
            });
            $list_player.on('touchstart',function (){
                if (canSlide) {
                    $music_detailPage.addClass('slide-up').removeClass('slide-down');
                }
            });
            $audio_control.on('touchstart',function (){
                if ($audioState==='play') {
                    audioPlayer.pause();
                }else if ($audioState==='pause') {
                    audioPlayer.play();
                }
                return false;
            });
        }
        function showList_player(img,name,musicName,audio){
            var music_img= $list_player.find('.music-img img');
            music_img.addClass('rotate');
            music_img[0].src=img;
            var music_name =$list_player.find('.music-name');
            music_name.text(musicName);
            var singer =$list_player.find('.singer');
            singer.text(name);
            $audio_control.show();
            canSlide=true;
            $audio.src='images/'+audio;
            audioPlayer.play();
        }
        function init(){
            MusicList_ByGET();
            bindFunctions();
        }
        return {
            init:init,
            showList_player:showList_player
        }
    })()
    var music_detailPage=(function(){
        var $music_detailPage=$('.music-detailPage');
        var $detailPage_title=$music_detailPage.find('.detailPage-title');
        var $music_name=$music_detailPage.find('.music-name');
        var $name=$music_detailPage.find('.name');
        var $lyric_item=$lyric_list.find('.lyric-item');
        var $progress=$music_detailPage.find('.progress');
        var $progress_lineBg=$progress.find('.progress-lineBg');
        var $prevBtn=$music_detailPage.find('.prevBtn');
        var $nextBtn=$music_detailPage.find('.nextBtn');
        $playBtn=$music_detailPage.find('.playBtn');
        $current_time=$progress.find('.current-time');
        $progress_line=$progress.find('.progress-line');
        $bar=$progress.find('.bar');
        $total_time=$progress.find('.total-time');
        var $progress_lineBgWidth=$progress_lineBg.outerWidth();
        var everyLine_time=[];
        var everyLine_lyric=[];
        var tstart=0;
        var barstart=0;
        var currentMusicT=0;
        var $lyric_itemHeight;
        function loadMusicInfo(id){
            $.ajax({
                url:'data/music_list.json',
                type:'GET',
                dataType:'json',
                success:function (data){
                    var img='images/'+data[id-1].img,
                        audio=data[id-1].audio,
                        name=data[id-1].name,
                        musicName=data[id-1].musicName,
                        lyric=data[id-1].lyric
                    music_listPage.showList_player(img,name,musicName,audio);
                    showMusic_detailPage(name,musicName,lyric)
                }
            })
        }
        function bindFunctions(){
            $detailPage_title.on('touchstart',function (){
                $music_detailPage.addClass('slide-down').removeClass('slide-up');
            });
            $bar.on("touchstart",function (ev){
                tstart=ev.originalEvent.changedTouches[0].pageX;
                barstart=parseInt($bar.css("left"))
                audioPlayer.pause();
                currentMusicT=$audio.currentTime;
                var duration=$audio.duration
            });
            $bar.on("touchmove",function (ev){
                var tmoveX=ev.originalEvent.changedTouches[0].pageX;
                var tmovedX=tmoveX-tstart;
                var barmove=barstart+tmovedX;
                barmove=barmove<0?0:barmove>$progress_lineBgWidth?$progress_lineBgWidth:barmove;
                var scale=barmove/$progress_lineBgWidth;
                /*防止拉倒最底时一直往连续跳下一首歌：scale>=1?0.99*/
                scale=scale>=1?0.99:scale;
                $audio.currentTime=$audio.duration*scale;
                $bar.css("left",barmove);
                $progress_line.css("width",scale*100+"%");
                $current_time.text(TimeToFormat($audio.currentTime));
                //阻止整个歌词部分也跟着移动
                return false;
            });
            $bar.on("touchend",function (ev){
                audioPlayer.play();
                currentLyricLine();
            });
            $playBtn.on('touchstart',function (){
                if ($audioState==='play') {
                    audioPlayer.pause();
                }else if ($audioState==='pause') {
                    audioPlayer.play();
                }
            });
            $prevBtn.on('touchstart',function (){
                audioPlayer.playPrev();
            });
            $nextBtn.on('touchstart',function (){
                audioPlayer.playNext();
            });
        }
        function showMusic_detailPage(name,musicName,lyric){
            $music_name.text(musicName);
            $name.text(name);
            showLyric(lyric)
        }
        function showLyric(lyric){
            var reg=/\[[^[]+/g;
            var everyLineLyric=lyric.match(reg);
            $lyric_list.html('');
            /*别忘记清空时间、歌词数组
            * 前一个有63行，现歌词只有53行时，会导致54—63依然为前首歌的歌词和时间
            * */
            everyLine_time=[];
            everyLine_lyric=[];
            for (var i = 0, len = everyLineLyric.length; i < len; i++) {
                everyLine_time[i]=formatTimeToSec(everyLineLyric[i].substr(1,8));
                everyLine_lyric[i]=everyLineLyric[i].substr(10).trim();
                $('<li class="lyric-item">'+everyLine_lyric[i]+'</li>').appendTo($lyric_list);
            }
            $($audio).one('canplaythrough',function (){
                $total_time.text(TimeToFormat($audio.duration));
            });
            $($audio).one('ended',function (){
                audioPlayer.playNext();
            });
            $lyric_item=$lyric_list.find('.lyric-item');
            $lyric_itemHeight=$lyric_item.outerHeight(true);
        }
        function currentLyricLine(audioCurrentTime){
            for (var i = 0, len = everyLine_time.length; i < len; i++) {
                if (i!==everyLine_time.length-1&&everyLine_time[i]<audioCurrentTime&&audioCurrentTime<everyLine_time[i+1]) {
                    $lyric_item.eq(i).addClass('active').siblings().removeClass('active');
                    if (i>3) {
                        $lyric_list.css('transform','translateY('+(-$lyric_itemHeight*(i-3))+'px)');
                    }
                }else if (i===everyLine_time.length-1&&audioCurrentTime>everyLine_time[i]) {
                    $lyric_item.eq(i).addClass('active').siblings().removeClass('active');
                    $lyric_list.css('transform','translateY('+(-$lyric_itemHeight*(i-3))+'px)');
                }
            }
        }
        function formatTimeToSec(time){
            var minute=parseInt(time);
            var second=parseInt(time.substr(3,2));
            var millisecond=Number(time.substr(5));
            var totalSecond=minute*60+second+millisecond;
            return totalSecond;
        }
        function TimeToFormat(second) {
            var minute = Math.floor(second / 60);
            var Second = Math.floor(second % 60);
            minute = minute < 10 ? '0' + minute : minute;
            Second = Second < 10 ? '0' + Second : Second;
            return minute + ':' + Second;
        }
        function init(){
            bindFunctions();
        }
        return{
            init:init,
            loadMusicInfo:loadMusicInfo,
            currentLyricLine:currentLyricLine,
            TimeToFormat:TimeToFormat,
            loadMusicInfo:loadMusicInfo
        }
    })();
    var audioPlayer=(function (){
        var timer=null;
        function play(){
            $audio.play();
            $audioState='play';
            $audio_control.css('backgroundImage','url(images/list_audioPause.png)');
            $playBtn.css('backgroundImage','url(images/details_pause.png)');
            clearInterval(timer);
            timer=setInterval(playing,1000);

        }
        function pause(){
            $audio.pause();
            clearInterval(timer);
            $audioState='pause';
            $audio_control.css('backgroundImage','url(images/list_audioPlay.png)');
            $playBtn.css('backgroundImage','url(images/details_play.png)');
        }
        function playing(){
            $current_time.text(music_detailPage.TimeToFormat($audio.currentTime));
            var scale=$audio.currentTime/$audio.duration;
            $progress_line.css('width',scale*100+'%');
            $bar.css('left',scale*100+'%');
            music_detailPage.currentLyricLine($audio.currentTime);
        }
        function playNext(){
            CurrentMusicNumber=CurrentMusicNumber>=lastList_itemIndex?1:CurrentMusicNumber+1;
            music_detailPage.loadMusicInfo(CurrentMusicNumber);
            $lyric_list.css('transform','translateY(0)');
            $list_item.eq(CurrentMusicNumber-1).addClass('active').siblings().removeClass('active');
        }
        function playPrev(){
            CurrentMusicNumber=CurrentMusicNumber<=1?lastList_itemIndex:CurrentMusicNumber-1;
            music_detailPage.loadMusicInfo(CurrentMusicNumber);
            $lyric_list.css('transform','translateY(0)');
            $list_item.eq(CurrentMusicNumber-1).addClass('active').siblings().removeClass('active');
        }
        return{
            play:play,
            pause:pause,
            playNext:playNext,
            playPrev:playPrev
        }
    })()
})();
new Loading('.loading-wrapper',['images/bg.jpg','images/bujiangjiu.jpg','images/cengjingdeni.jpg','images/detailsBg.jpg','images/dongxiaojie.jpg','images/fannaoge.jpg','images/hongchenkezhan.jpg','images/miaov.jpg','images/naxiehua.jpg','images/nizhan.jpg','images/qudali.jpg','images/xiangyiweiming.jpg','images/yixiangren.jpg'])

/*music-listPage竖向滚动*/
