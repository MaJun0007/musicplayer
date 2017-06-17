$(function (){

    var musicListAudio=$(".musicListAudio"),
        audioImg=musicListAudio.find(".audioImg"),
        musicTitle=musicListAudio.find(".musicTitle"),
        $musicDetail=$(".musicDetail"),
        audioInfor_name=musicListAudio.find(".name"),
        audioBtn=musicListAudio.find(".audioBtn"),
        canToucheAudio=false,
        currentMusicId= 0,
        nextMusicId=0,
        currentMusicIndex=0;
    var audioBtnList=$(".audioBtnList"),
        prevMusic=audioBtnList.find(".prevMusic"),
        playMusic=audioBtnList.find(".playMusic"),
        nextMusic=audioBtnList.find(".nextMusic");
    var MusicTimeProgress=$musicDetail.find(".MusicTimeProgress");
    var MusicTimeProgressBar=$musicDetail.find(".MusicTimeProgressBar");

    var audio=$("#audioPlayer").get(0),
        audioStatus="pause";
    function init(){
        musicList.init();
        musicAudio.init();
        musicDetail.init();
        audioPlayer.init();
    }
    var musicList=(function(){
        var header=$(".header");
        var header_height=header.outerHeight();
        var musicList_header=$(".musicList_header");
        var musicList_headerHeight=musicList_header.outerHeight();
        var musicList_main=$(".musicList_main");
        var musicList_mainHeight=musicList_main.outerHeight();
        var musicList_list=$(".musicList_list");
        var musicList_listHeight=0;
        var musicList_list_liHeight=$(".musicList_list").find("li").outerHeight();
        var musicListAudioHeight=musicListAudio.outerHeight();
        var page=0;
        var tstartPX= 0,
            tcurrentPX= 0,
            tendPX= 0,
            tstartPY= 0,
            tcurrentPY= 0,
            tendPY= 0,
            cstartY= 0,
            ccurrentY= 0,
            ccanmoveY= 0,
            cendY= 0,
            musicList_listMaxTop= 0,
            musicListIsMoving=false,
            musicListIsMovingX=false,
            musicListIsMovingY=false,
            canLoadMoreMusics=false,
            getStartOnceWhenOutTop=true,
            getStartOnceWhenOutBottom=true;
        var ccurrentY=0;
        var startTime=1;
        var endTime=1;
        function init(){
            loadData();
            bindFunctions();
            slidMove();
            musicList_list.css("transform","translateY("+0+"px)");
        }
        function loadData(){
            $.ajax({
                url:"php/getMusiclist.php",
                type:"GET",
                dataType:"json",
                data:{page:page},
                success:function (data){
                    $.each(data,function (index,value){
                        var li=$('<li data-id='+value.id+' data-class='+value.class+'><h3 class="musicTitle">'+value.musicName+'</h3> <span class="name">'+value.name+'</span></li>');
                        musicList_list.append(li);
                    });
                }
            })
        }
        function loadMoreMusic(){
            page++;
            loadData();
        }
        function bindFunctions(){
            musicList_list.delegate("li","touchend",function (){
                if(!musicListIsMoving){
                    $(this).addClass("active").siblings().removeClass("active");
                    currentMusicId=$(this).data("id");
                    musicAudio.getMusicInfo(currentMusicId);
                    currentMusicIndex=$(this).index();
                    nextMusicId=$(this).eq(currentMusicIndex+1).data("id");
                    canToucheAudio=true;
                }
            })
        }
        function slidMove(){
            musicList_main.on("touchstart",function (ev){
                tstartPY=ev.originalEvent.changedTouches[0].pageY;
                tstartPX=ev.originalEvent.changedTouches[0].pageX;
                cstartY=musicList_list.position().top;
                startTime=new Date().getTime();
                musicList_listHeight=musicList_list.outerHeight();
                musicList_listMaxTop=musicList_mainHeight-musicList_listHeight-header_height-musicListAudioHeight;
                ccanmoveY=1;
                musicList_list.css("transition","none");
                musicListIsMovingX=false;
                musicListIsMovingY=false;
                canLoadMoreMusics=false;
                getStartOnceWhenOutTop=true;
                getStartOnceWhenOutBottom=true;
            });
            musicList_main.on("touchmove",function (ev){
                musicListIsMoving=true;
                tcurrentPY=ev.originalEvent.changedTouches[0].pageY;
                tcurrentPX=ev.originalEvent.changedTouches[0].pageX;
                var tmovedY=tcurrentPY-tstartPY;
                var tmovedX=tcurrentPX-tstartPX;
                if(Math.abs(tmovedY)>Math.abs(tmovedX)){
                    musicListIsMovingY=true;
                }
                if( musicListIsMovingY){
                    var cmoveY=cstartY+tmovedY;
                    ccurrentY=musicList_list.position().top;
                    if(ccurrentY>=0){
                        ccanmoveY=1-Math.abs(ccurrentY/musicList_mainHeight)*3;
                        ccanmoveY=ccanmoveY<=0?0:ccanmoveY;
                        if(getStartOnceWhenOutTop){
                            getStartOnceWhenOutTop=false;
                            tstartPY=ev.originalEvent.changedTouches[0].pageY;
                        }
                        tmovedY=tcurrentPY-tstartPY;
                        cmoveY=tmovedY*ccanmoveY;
                        if(cmoveY>=musicList_mainHeight/6){
                            cmoveY=musicList_mainHeight/6;
                        }
                        musicList_list.css("transform","translateY("+cmoveY+"px)");
                    }else if(ccurrentY<musicList_listMaxTop){
                        if(getStartOnceWhenOutBottom){
                            getStartOnceWhenOutBottom=false;
                            tstartPY=ev.originalEvent.changedTouches[0].pageY;
                            cstartY=musicList_list.position().top;
                            musicList_list.append($('<li class="addMoreMusic"><h3>加载更多(ﾉ´▽｀)ﾉ♪</h3></li>'));
                        }
                        tmovedY=tcurrentPY-tstartPY;
                        cmoveY=musicList_listMaxTop+tmovedY/3;
                        if(tmovedY<=-musicList_mainHeight/8){
                            tmovedY=-musicList_mainHeight/8;
                            canLoadMoreMusics=true;
                        }
                        console.log(tcurrentPY,cmoveY,-musicList_mainHeight/8);
                        musicList_list.css("transform","translateY("+cmoveY+"px)");
                    }else {
                        musicList_list.css("transform","translateY("+cmoveY+"px)");
                    }
                }
            });
            musicList_main.on("touchend",function (ev){
                var addMoreMusic=$(".addMoreMusic");
                musicListIsMoving=false;
                tendPY=ev.originalEvent.changedTouches[0].pageY;
                var endTime=new Date().getTime();
                var useTime=endTime-startTime;
                var hasMoved=tstartPY-tendPY;
                var speed=-hasMoved/useTime*120;
                ccurrentY=musicList_list.position().top;
                var totalMove=ccurrentY+speed;
                musicList_list.css("transition","0.5s cubic-bezier(0,1.2,.22,.21)");
                if(totalMove>=0){
                    totalMove=0;
                    musicList_list.css("transition","700ms cubic-bezier(0,1.2,.22,.21)");
                }else if(totalMove<=musicList_listMaxTop){
                    if(canLoadMoreMusics){
                        loadMoreMusic();
                        addMoreMusic.find()
                    }
                    totalMove=musicList_listMaxTop;
                    addMoreMusic.remove();
                    musicList_list.css("transition","700ms cubic-bezier(0,1.2,.22,.21)");
                }
                musicList_list.css("transform","translateY("+totalMove+"px)");
            })
        }
        return{
            init:init
        }
    })();
    var musicAudio=(function(){
        var xhr=null
        function init(){
            bindFunctions();
        }
        function getMusicInfo(id){
            if(xhr){
                xhr.abort();
            }
            xhr=$.ajax({
                url:"php/getMusic.php",
                type:"GET",
                data:{id:id},
                dataType:"json",
                success:function (data){
                    musicAudioShow(data.img,data.musicName,data.name,data.audio);
                    musicDetail.musicDetailShow(data.musicName,data.name,data.lyric,data.class,data.audio)
                }
            })
        }
        function musicAudioShow(img,musicName,name,src){
            audioImg.attr("src","img/"+img);
            musicTitle.html(musicName);
            audioInfor_name.html(name);
            audioBtn.show();
            audio.src="img/"+src;
            audioPlayer.play();
            $(audio).one('canplaythrough',function(){
                musicDetail.formatTotalMusicTime(audio.duration);
            });
            $(audio).one('ended',function() {
                audioPlayer.playNext();
            })
        }
        function bindFunctions(){
            audioBtn.on("touchstart",function (){
                if(audioStatus==="pause"){
                    audioPlayer.play();
                }else if(audioStatus==="playing"){
                    audioPlayer.pause();
                }
                return false;
            })
            musicListAudio.on("touchstart",function (){
                if(canToucheAudio){
                    $musicDetail.css("transform","translateY(0)");
                }
            })
        }
        return {
            init:init,
            getMusicInfo:getMusicInfo
        }
    })();
    var musicDetail=(function(){
        var musicDetail_header=$musicDetail.find(".musicDetail_header")
        var musicLyric_list_li=null;
        var musicLyric_list_liHeight=0;
        var totalMusicTime=$musicDetail.find(".totalMusicTime");
        var currentMusicTime=$musicDetail.find(".currentMusicTime");
        var MusicTimeProgressBG=$musicDetail.find(".MusicTimeProgressBG");
        var content=$musicDetail.find(".content");
        var discuss=$musicDetail.find(".discuss");
        var currentMusicT=0;
        var tstart=0;
        var disstart=0;
        var barstart=0;
        var contentstart=0;
        var everyLine=[];
        var everyLine_time=[];
        var everyLine_content=[];
        function init(){
            bindFunction()
        }
        function bindFunction(){
            musicDetail_header.on("touchstart",function (){
                $musicDetail.css("transform","translateY(100%)");
            })
            musicDetail_header.on("touchend",function (event){
                event.preventDefault();
            })
            MusicTimeProgressBar.on("touchstart",function (ev){
                tstart=ev.originalEvent.changedTouches[0].pageX;
                barstart=parseInt(MusicTimeProgressBar.css("left"))
                audioPlayer.pause();
                currentMusicT=audio.currentTime;
            })
            MusicTimeProgressBar.on("touchmove",function (ev){
                var tmoveX=ev.originalEvent.changedTouches[0].pageX;
                var tmovedX=tmoveX-tstart;
                var barmove=barstart+tmovedX;
                barmove=barmove<0?0:barmove>180?180:barmove;
                var scale=barmove/180;
                audio.currentTime=audio.duration*scale;
                MusicTimeProgressBar.css("left",barmove);
                MusicTimeProgress.css("width",scale*100+"%");
                formatCurrentMusicTime(audio.currentTime);
                //阻止整个歌词部分也跟着移动
                return false;
            })
            MusicTimeProgressBar.on("touchend",function (ev){
                audioPlayer.play();
            })
            prevMusic.on("touchend",function (){
                audioPlayer.playPrev();
            })
            playMusic.on("touchend",function (){
                if(audioStatus==="playing"){
                    audioPlayer.pause();
                }else if(audioStatus==="pause"){
                    audioPlayer.play();
                }
            })
            nextMusic.on("touchend",function (){
                audioPlayer.playNext();
            })
            $musicDetail.on("touchstart",function (ev){
                tstart=ev.originalEvent.changedTouches[0].pageX;
                disstart=parseInt(discuss.position().left);
                contentstart=parseInt(content.position().left);
            })
            $musicDetail.on("touchmove",function (ev){
                var tmoveX=ev.originalEvent.changedTouches[0].pageX;
                var tmovedX=tmoveX-tstart;
                var dismove=disstart+tmovedX;
                var contentlmove=contentstart+tmovedX;
                discuss.css("transform","translateX("+dismove+"px)");
                content.css("transform","translateX("+contentlmove+"px)");
            })
            $musicDetail.on("touchend",function (ev){
            })

        }
       function musicDetailShow(musicName,name,lyric,musicClass,src){
           $musicDetail.find(".header_title").html(musicName+"<span>"+name+"</span>");
           //只有加载完后才能获取时间
           $musicDetail.find(".musicLyric_list").html("").css("transform","translateY(0px)");
           everyLine=lyric.match(/\[[^[]+/g);
           everyLine_time=[];
           everyLine_content=[];
           for(var i=0,len=everyLine.length; i<len; i++){
               if(everyLine[i].substring(11).trim().length){
                   everyLine_time.push(formatMusicLyric_listTime(everyLine[i].substring(1,9)));
                   everyLine_content.push(everyLine[i].substring(11));
                   $musicDetail.find(".musicLyric_list").append($("<li>"+everyLine[i].substring(11)+"</li>"));
               }
           }
           $musicDetail.find(".musicLyric_list li").first().addClass("active");
           musicLyric_list_li=$musicDetail.find(".musicLyric_list li");
           musicLyric_list_liHeight=musicLyric_list_li.outerHeight(true);
       }
        function MusicLyricScroll(current){
            for(var i=0,len=everyLine_time.length; i<len; i++){
                if(i!=everyLine.length-1&&current<everyLine_time[i+1]&&current>everyLine_time[i]){
                    musicLyric_list_li.eq(i).addClass("active").siblings().removeClass("active");
                    if(i>3){
                        $musicDetail.find(".musicLyric_list").css("transform","translateY("+(-musicLyric_list_liHeight*(i-3))+"px)");
                    }
                }else if(i===everyLine.length-1&&current>everyLine_time[i]){
                    musicLyric_list_li.eq(i).addClass("active").siblings().removeClass("active");
                    $musicDetail.find(".musicLyric_list").css("transform","translateY("+(-musicLyric_list_liHeight*(i-3))+"px)");
                }
            }
        }
        function formatMusicLyric_listTime(time){
            var times=time.split(":");
            return parseInt(Number(times[0])*60+Number(times[1]));
        }
        function formatTotalMusicTime(seconds){
            var min=Math.floor(seconds/60);
            min=min<10?"0"+min:min;
            var second=Math.floor(seconds%60);
            second=second<10?"0"+second:second;
            totalMusicTime.html(min+":"+second);
        }
        function formatCurrentMusicTime(seconds){
            var min=Math.floor(seconds/60);
            min=min<10?"0"+min:min;
            var second=Math.floor(seconds%60);
            second=second<10?"0"+second:second;
            currentMusicTime.html(min+":"+second);
        }
        return{
            init:init,
            musicDetailShow:musicDetailShow,
            formatTotalMusicTime:formatTotalMusicTime,
            formatCurrentMusicTime:formatCurrentMusicTime,
            MusicLyricScroll:MusicLyricScroll
        }
    })();
    var audioPlayer=(function(){
        var timer=null;
        var scale=0;
        function init(){
            bindFunction();
        }
        function bindFunction(){

        }
        function play(){
            audio.play();
            audioStatus="playing";
            audioImg.addClass("rotate");
            audioBtn.css("backgroundImage","url(img/list_audioPause.png)");
            playMusic.css("backgroundImage","url(img/details_pause.png)");
            clearInterval(timer);
            timer=setInterval(playing,1000);
        }
        function playing(){
            musicDetail.formatCurrentMusicTime(audio.currentTime);
            scale=audio.currentTime / audio.duration;
            MusicTimeProgress.css("width",scale*100+"%");
            MusicTimeProgressBar.css("left",scale*100+"%");
            musicDetail.MusicLyricScroll(audio.currentTime);
        }
        function pause(){
            audio.pause();
            audioStatus="pause";
            audioImg.removeClass("rotate");
            audioBtn.css("backgroundImage","url(img/list_audioPlay.png)");
            playMusic.css("backgroundImage","url(img/details_play.png)");
        }
        function playNext(){
            var musicList_list_li=$(".musicList_list").find("li");
            currentMusicIndex=currentMusicIndex>musicList_list_li.length-1?0:currentMusicIndex+1;
            nextMusicId=musicList_list_li.eq(currentMusicIndex).data("id")
            musicList_list_li.eq(currentMusicIndex).addClass("active").siblings().removeClass("active");
            musicAudio.getMusicInfo(nextMusicId);
        }
        function playPrev(){
            var musicList_list_li=$(".musicList_list").find("li");
            currentMusicIndex=currentMusicIndex<0?musicList_list_li.length-1:currentMusicIndex-1;
            nextMusicId=musicList_list_li.eq(currentMusicIndex).data("id")
            musicList_list_li.eq(currentMusicIndex).addClass("active").siblings().removeClass("active");
            musicAudio.getMusicInfo(nextMusicId);
        }
        return{
            init:init,
            play:play,
            pause:pause,
            playNext:playNext,
            playPrev:playPrev
        }
    })();
    init();
})