var config = {
    buttonHeight: 50,
    buttonWidth: 200,
    buttonPadding: 10,
    buttonsBottomPixels: 0,
    containerPadding: 20,
    danmu_listentimemili: 5000,
    enableListenDanmu: true,
}

var updatechecked = function () {
    var cbx = $('#cb_listendanmu');
    var checked = cbx[0].checked;
    config.enableListenDanmu = checked;
}

var initButton = function (text, x, y) {
    if (!(x && y)) {
        x = 0;
        y = 0;
    }

    // var button = $('<div class="video_action_button"></div>');
    var button = $('<div class="button button-3"></div>');
    button.css('position', 'absolute');
    button.css('z-index', '999');
    button.css('left', x);
    button.css('top', y);
    button.appendTo($('body'));
    button.text(text);
    // alert(button.html());
    return button;
}

var clearButton = function () {
    buttonList = [];
    $('.button').remove();
    // $('.video_action_button').remove();
    $('.tooltip-inner').remove();
    $('.tooltip-arrow').remove();
}

var absPosition = function (ele) {
    var offset = ele.offset();
    return offset;
}

var dropNewButton = function (text, videoEle, belowCount) {
    offset = absPosition(videoEle);
    x = offset.left;
    y = offset.top;

    videoHeight = parseInt(videoEle.attr('height'));

    toX = offset.left + config.buttonPadding;
    toY = y + videoHeight - (belowCount + 1) * (config.buttonHeight + 2 * config.buttonPadding) - config.buttonsBottomPixels;


    button = initButton(text, x + config.buttonPadding, y + config.buttonPadding);
    button.animate({ left: toX+'px', top: toY+'px' }, 3000);
    return button;
}

var dropSlot = function (buttonEle, slot) {
    if (!slot) {
        slot = 1;
    }
    offset = absPosition(buttonEle);
    x = offset.left;
    y = offset.top;
    toY = y + (config.buttonHeight + config.buttonPadding) * slot;

    //buttonEle.css('left', x);
    //buttonEle.css('top', toY);
    buttonEle.animate({ left: x, top: toY }, 300);
}

var dropSlotIndex = function (buttonList, index, slot) {
    var buttonEle = buttonList[index];
    dropSlot(buttonEle, slot);
}

var removeButton = function (buttonEle, videoEle, buttonList) {
    offset = absPosition(buttonEle);
    x = offset.left;
    width = parseInt(videoEle.attr('width'));
    toX = x + width;
    buttonEle.animate({ left: toX, opacity: 0 }, 500);
    var index = 0;
    for (var i = 0; i < buttonList.length; i++) {
        var current = buttonList[i];
        if (buttonEle.text() == current.text()) {
            index = i;
        }
    }

    buttonList.splice(index, 1);
    for (let i = index; i < buttonList.length; i++) {
        dropSlotIndex(buttonList, i, 1);
    }
}

var clearButtonList = function (buttonList) {
    buttons = $('.video_action_button');
    buttons.hide();
    buttonList = [];
}

var bindtooltip = function (button, text) {
    button.attr('title', text);
    button.tooltip({
        show: null,
        position: {
            my: "left bottom",
            at: "left top"
        },
        open: function (event, ui) {
            ui.tooltip.animate({ top: ui.tooltip.position().top - 10 }, "fast");
        }
    });
}

var showTopBar = function (text, containerEle, videoid) {
    if (!containerEle) {
        containerEle = video;
    }
    var div = $("#top_bar");
    div.css('display', 'none');
    var offset = absPosition(containerEle);
    var left = offset.left + config.buttonPadding;
    var top = offset.top + config.buttonPadding;
    var width = parseFloat(containerEle.css('width')) - 2 * config.buttonPadding;
    div.css('left', left);
    div.css('top', top);
    div.css('width', width);
    div.css('max-width', width);
    div.text(text);
    if (videoid) {
        div.attr('title', videoid);
    }

    div.fadeIn();
}

var loadedState = false;
var slided = false;
var slidechecked = false;
var setSlideTopBar = function (text, containerEle, question, autoplay, minwaitingmilisec, afterslided) {
    var div = $("#top_bar");
    // div.css('display', 'none');
    var offset = absPosition(containerEle);
    var left = offset.left + config.buttonPadding;
    var top = offset.top + config.buttonPadding;
    var width = parseFloat(containerEle.css('width')) - 2 * config.buttonPadding;
    div.css('width', width);
    div.css('max-width', width);
    div.text(text);
    var divheight = parseFloat(div.css('height'));
    var top0 = offset.top + parseFloat(containerEle.css('height')) / 2 - divheight / 2;
    div.css('left', left);
    div.css('top', top0);
    if (question) {
        div.attr('title', question);
    }

    var cover = $('#cover_box');
    cover.css('display', "block");
    cover.css('width', containerEle.css('width'));
    cover.css('height', containerEle.css('height'));
    cover.css('top', offset.top);
    cover.css('left', offset.left);

    loadedState = false;
    slided = false;
    slidechecked = false;
    setTimeout(function () {
        if (loadedState && !slided) {
            slideTopBar(autoplay, 1000, afterslided);
            slided = true;
        }
        slidechecked = true;
    }, minwaitingmilisec);
}

var slideTopBar = function (autoplay, duringmilisec, callbackActions) {
    var bar = $("#top_bar");
    var video = $('#main_video');
    // div.css('display', 'none');
    var offset = absPosition(video);
    var top = offset.top + config.buttonPadding;
    var cover = $('#cover_box');
    if (!duringmilisec) {
        duringmilisec = 1000;
    }
    bar.animate({
        top: top
    }, duringmilisec, function () {
        if (autoplay) {
            video[0].play();

            if (callbackActions) {
                // alert('slide call back.');
                setTimeout(callbackActions, 500);
            }
        }
    });
    cover.fadeOut();
    //if (callbackActions) {
    //    setTimeout(callbackActions, duringmilisec * 2);
    //}
}

var restartVideo = function () {
    try {
        video[0].pause();
        video[0].currentTime = 0;
        video[0].play();
    } catch (ex) {
        alert(ex);
    }
}

var adjustTextBoxInputContainer = function () {
    var textbox_input_container = $('#textbox_input_container');
    var textbox_input = $('#tb_textinput');
    var submitbutton = $('#video_action_button');
    var videoposition = absPosition(video);
    textbox_input_container.css('left', videoposition.left + config.containerPadding);
    textbox_input_container.css('top', videoposition.top + video.height() - textbox_input_container.height() - 2 * config.containerPadding);
    textbox_input_container.css('width', video.width() - 2 * config.containerPadding);

    var refreshdiv = $('#div_replay');
    refreshdiv.css('display', 'block');
    refreshdiv.css('left', videoposition.left + video.width() - refreshdiv.width() - 2 * config.containerPadding);
    refreshdiv.css('top', videoposition.top + video.height() - refreshdiv.height() - 2 * config.containerPadding);
}


var showTextboxInput = function () {
    adjustTextBoxInputContainer();
    var textbox_input_container = $('#textbox_input_container');
    if (textbox_input_container.css('display') == 'none') {
        textbox_input_container.show();
        buttonsUp();
    }
}

var hideTextboxInput = function () {
    adjustTextBoxInputContainer();
    var textbox_input_container = $('#textbox_input_container');
    if (textbox_input_container.css('display') != 'none') {
        textbox_input_container.hide();
        buttonsDown();
    }
}

var buttonsUp = function (pixels) {
    var textbox_input_container = $('#textbox_input_container');
    var buttons = $('.video_action_button');
    if (!pixels) {
        pixels = textbox_input_container.height() + 2 * config.containerPadding;
    }
    buttons.css('top', parseFloat(buttons.css('top')) - pixels);
    refreshbutton = $('#div_replay');
    refreshbutton.css('top', parseFloat(refreshbutton.css('top')) - pixels);
    config.buttonsBottomPixels += pixels;
}

var buttonsDown = function (pixels) {
    var textbox_input_container = $('#textbox_input_container');
    var buttons = $('.video_action_button');
    if (!pixels) {
        pixels = textbox_input_container.height() + 2 * config.containerPadding;
    }
    buttons.css('top', parseFloat(buttons.css('top')) + pixels);
    refreshbutton = $('#div_replay');
    refreshbutton.css('top', parseFloat(refreshbutton.css('top')) + pixels);
    config.buttonsBottomPixels -= pixels;
}

var fetchStream = function (selections,acceptCustomText, timestamp, callbackFunc) {
    var req = '/Immortal/GetDanmuStream?selections=' + selections + '&acceptCustomText=' + acceptCustomText + '&from=' + timestamp + '&platform=bilibili&toProduct=' + packageId;
    // alert(req);
    $.ajax({
        url: req, // 替换为你的API端点
        type: 'GET', // 请求类型，可以是GET、POST等
        dataType: 'text', // 期望从服务器返回的数据类型
        success: function (response) {
            // alert(response);
            respJS = JSON.parse(response);
            // 请求成功时的回调函数
            callbackFunc(respJS);
        },
        error: function (xhr, status, error) {
            // 请求失败时的回调函数
            console.error('Error:', error);
        }
    });
}

var timeflag = 0;
var listenStream = function (selections, customText, timeinterval, bindEle, event, callbackFunc, uselastflag) {
    var date = new Date();
    var stampMilisec = date.getTime();
    if (uselastflag) {
        stampMilisec = timeflag;
    }
    else {
        timeflag = stampMilisec;
    }
    var eventFunction = function () {
        // alert('event triggered.');
        // alert(date.getTime());
        setTimeout(
            function () {
                // alert(date.getTime());
                fetchStream(selections, customText, stampMilisec, function (result) {
                    //if (bindEle && event) {
                    //    // alert('off event.');
                    //    bindEle.off(event, null, eventFunction);
                    //}
                    callbackFunc(result);
                });
                
            }, timeinterval
        )
    };
    if (!bindEle || !event) {
        // alert('no event binding')
        eventFunction();
    }
    else {
        // alert('on ' + event + ": to listen. ");
        video.one('ended', eventFunction);
        // bindEle.on(event, eventFunction);
    }
}

var grepButtonByText = function (text) {
    var buttons = $('.video_action_button');

    for (var i = 0; i < buttons.length; i++) {
        var current = $(buttons[i]);
        var txt = current.text();
        if (txt == text) {
            return current;
        }
    }
    return null;
}