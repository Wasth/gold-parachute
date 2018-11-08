var pause = false;
var sound = true;
var bgAudio;
var dead = false;
var nickname = '';
var mm = 0;
var ss = 0;
var speed = 0.5;
var score = 0;
var cometCount = 0;

$(function () {
    $('.start-screen input').on('keyup', function () {
        let username = $(this).val().trim();
        if(username == '') {
            $('.start-screen button').addClass('disabled');
        }else {
            $('.start-screen button').removeClass('disabled');
        }

    });
    $('.start-screen button').click(function () {
        if(!$(this).hasClass('disabled')) {
            $('.start-screen').fadeOut(1000, function () {
                $('.game-screen').fadeIn(1000, function () {
                    init();
                })
            });
            nickname = $('.start-screen input').val().trim()
            $('.username').text(nickname);
        }
    });
});

function init(){
    timer();
    spawnComet();
    moveComets();
    pausing();
    setupBgMusic();
    someActions();
}


/*
    INIT FUNCTIONS
 */
function setupBgMusic(){
    bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.src = 'sound/ourhymn.mp3';
    bgAudio.play();
}
function pausing(){
    $(document).on('keyup', function (e) {
        if(e.key === ' ') {
            pauseToggle(e);
        }
    });
    $('.pause').click(pauseToggle);
}
function spawnComet(){
    if(!pause && !dead){
        let chance = getRandomInt(2);
        if(chance === 1){
            let size = getRandomInt(2);
            cometCount++;
            if(cometCount % 3 == 0){
                speed+=0.5;
            }
            var w = $('.field').width() - 120;
            var x = getRandomInt(w);
            if(size == 0) {
                $('.field').append('<div data-speed="'+speed+'" style="left: '+x+'px; top: -250px" data-click="1" class="comet small"></div>');
            }else {
                $('.field').append('<div data-speed="'+speed+'" style="left: '+x+'px; top: -250px" data-click="2" class="comet big"></div>');
            }
            $('.comet').click(cometClick);
        }
    }
    setTimeout(spawnComet, 1000);
}
function moveComets(){
    if(!pause && !dead){
        $('.comet').each(function () {
            var ch = $(this).height();
            var cy = parseInt($(this).css('top'));
            var h = $('.field').height();
            if(cy+ch > h) {
                if($(this).find('.parachute').length == 0){
                    if(nickname != 'tester') {
                        death();
                    }
                }else {
                    $(this).fadeOut(300, function () {
                        $(this).remove();
                    });
                }
            }else {
                let speed = $(this).attr('data-speed');
                $(this).css({
                    'top': '+='+speed+'px'
                });
            }
        });
    }
    setTimeout(moveComets, 5);
}
function timer(){
    if(!pause && !dead) {
        if(ss < 59){
            ss++;
        }else {
            ss = 0;
            mm+=1;
        }
        $('.timer').text((mm < 10 ? '0'+mm: mm)+':'+(ss < 10 ? '0'+ss: ss)+' |');
    }
    setTimeout(timer, 1000);
}
function someActions(){

    // sound handling
    $('.sound').click(function () {
        if(!pause && !dead){
            sound = !sound;
            if(sound) {
                bgAudio.play();
            }else {
                bgAudio.pause();
            }
        }
    });

    // font sizing
    $('.font-control .plus').click(function () {
        var fsz = parseInt($('.username-block').css('font-size'));
        if(fsz < 31) {
            $('.username-block').css({
                'font-size': '+=2px',
            });
        }
    });
    $('.font-control .minus').click(function () {
        $('.username-block').css({
            'font-size': '-=2px',
        });
    });

    //restarting
    $('.restart').click(function () {
        $('.finish-screen').fadeOut(500, function () {
            $('.game-screen').fadeIn(500);
        });
        pause = false;
        mm = 0;
        ss = 0;
        dead = false;
        speed = 0.5;
        score = 0;
        cometCount = 0;
        $('.comet').remove();
        setupBgMusic();
        $('.score').text('очков: '+score);

    });
}

/*
    HELP FUNCTIONS
 */
function pauseToggle(e){
    if(!dead){
        pause = !pause;
        if(pause) {
            $('.pause img').attr('src', 'image/pauseon.png');
            $('.sound, .font-control div').addClass('disabled');
            $('.pause-block').fadeIn(100);
            document.querySelectorAll('.parachute').forEach(function (elem) {
                elem.style.webkitAnimationPlayState = 'paused';
            });
        }else{
            $('.pause img').attr('src', 'image/pause.png');
            $('.sound, .font-control div').removeClass('disabled');
            $('.pause-block').fadeOut(100);
            document.querySelectorAll('.parachute').forEach(function (elem) {
                elem.style.webkitAnimationPlayState = 'running';
            })
        }
    }
}
function playFailSound(){
    if(sound) {
        var failAudio = new Audio();
        failAudio.src='sound/fail.mp3'
        failAudio.play();
    }
}
function playClickSound(){
    if(sound && !pause && !dead) {
        var clickAudio = new Audio();
        clickAudio.src='sound/click.wav';
        clickAudio.play();
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/*
    OTHER FUNCTIONS
 */
function cometClick(e){
    if(!pause && !dead) {
        var clicks = $(this).attr('data-click');
        clicks--;
        if(clicks == 0) {
            if($(this).find('.parachute').length == 0) {
                playClickSound();
                $(this).append('<div class="parachute"></div>');
                $(this).attr('data-speed', '0.3');
                if($(this).hasClass('big')) {
                    score+=2;
                }else if($(this).hasClass('small')) {
                    score+=1;
                }
                $('.score').text('очков: '+score);
            }

        }
        $(this).attr('data-click', clicks);
    }
}
function death(){
    dead = true;
    bgAudio.pause();
    playFailSound();
    $('.game-screen').fadeOut(500, function () {
        $('.r-score').text(score);
        $('.r-time').text((mm < 10 ? '0'+mm: mm)+':'+(ss < 10 ? '0'+ss: ss));
        $.ajax({
            url: '/records.php',
            method: 'POST',
            data: {
                username: nickname,
                score: score,
                time: (mm < 10 ? '0'+mm : mm)+':'+(ss < 10 ? '0'+ss : ss),
            },
            success: function (data) {
                var decoded = JSON.parse(data);
                console.log(decoded);
                var top = decoded.top;
                var cur = decoded.cur;
                $('table').html('');
                $('table').append('<tr>\n' +
                    '                    <td>#</td>\n' +
                    '                    <td>Имя товарища</td>\n' +
                    '                    <td>Очки</td>\n' +
                    '                    <td>Время игры</td>\n' +
                    '                </tr>');
                var showed = false;
                for(var i = 0;i < top.length; i++){
                    let curtime = top[i].time.split(':')[0]+':'+top[i].time.split(':')[1];
                    if(i < 10) {

                        if(cur.id == top[i].id) {
                            showed == true;
                            $('table').append('<tr class="tovarisch">\n' +
                                '                    <td>'+(i+1)+'</td>\n' +
                                '                    <td>'+top[i].username+'</td>\n' +
                                '                    <td>'+top[i].score+'</td>\n' +
                                '                    <td>'+curtime+'</td>\n' +
                                '                </tr>');
                        }else {
                            $('table').append('<tr>\n' +
                                '                    <td>'+(i+1)+'</td>\n' +
                                '                    <td>'+top[i].username+'</td>\n' +
                                '                    <td>'+top[i].score+'</td>\n' +
                                '                    <td>'+curtime+'</td>\n' +
                                '                </tr>');
                        }
                    }else if(i == 10 && !showed){
                        if(cur.id == top[i].id){
                            showed = true;
                            $('table').append('<tr class="tovarisch">\n' +
                                '                    <td>'+(i+1)+'</td>\n' +
                                '                    <td>'+top[i].username+'</td>\n' +
                                '                    <td>'+top[i].score+'</td>\n' +
                                '                    <td>'+curtime+'</td>\n' +
                                '                </tr>');
                            break;
                        }else {
                            $('table').append('<tr class="tovarisch">\n' +
                                '                    <td></td>\n' +
                                '                    <td>......</td>\n' +
                                '                    <td></td>\n' +
                                '                    <td></td>\n' +
                                '                </tr>');
                        }

                    }
                    else if(i > 10){
                        if(showed) {
                            break;
                        }
                        if(cur.id == top[i].id){
                            showed = true;
                            $('table').append('<tr class="tovarisch">\n' +
                                '                    <td>'+(i+1)+'</td>\n' +
                                '                    <td>'+top[i].username+'</td>\n' +
                                '                    <td>'+top[i].score+'</td>\n' +
                                '                    <td>'+curtime+'</td>\n' +
                                '                </tr>');
                        }
                    }
                }
            }
        });
        $('.finish-screen').fadeIn(500);
    });
}

