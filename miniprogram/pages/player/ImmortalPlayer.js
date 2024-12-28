var buttonList = [];
var video = $('#main_video');
var bgmAudio = $('#bgm_audio');
var bgmid = "";
var maxbuttonlimit = 4;
var debugbox_nodeid = $('#debugbox_nodeid');
var debugbox_nextlist = $('#debugbox_nextlist');
var debugbox_context = $('#debugbox_context');


var currentNode = "";
var packageId = id;
var context = {};

var actionList = [
    { text: '�ٸ磬������������Ҷȹ�������������ʱ�⣬ÿ���������ĸ��������Ҹе���ů��������лл���������ǵĸж���', title: '������ж�������������', id: '2024_3_30_10_50_59_565.mp4' },
    { text: '�ٸ磬���ĵ�Ӱ��Ʒ�е�ÿ����ɫ������ӡ����̣������ǡ������𼧡��еĳ̵��£������������ҳ������ݡ��������������ɫʱ����Щ�ĵ���᣿', title: '��ɫ�������ĵ����', id: '2024_3_30_10_50_59_570.mp4' },
    { text: '�ٸ磬�������������Ƕ��ǳ���ʹ�����������ֺ͵�Ӱ��Ʒ��Ȼ��������ǡ��������ģ����ǻ���Զ����������������������Զ���š�', title: '����Ļ���������Ӱ', id: '2024_3_30_10_50_59_572.mp4' },
    { text: '�ٸ磬��������Ȧ�е���Ե�ǳ��ã����������˶��Ǻ����ѡ�����������α�����Щ��������ģ�', title: '����Ȧ�����ά��', id: '2024_3_30_10_50_59_574.mp4' },
    { text: '�ٸ磬���������ϵ�׷���Ŭ�������Ƿǳ����塣��������ʲô�������׷�������������˵����', title: '��׷�������˵ļ���', id: '2024_3_30_10_50_59_577.mp4' },
    { text: '�ٸ磬�����ݳ���������ô���ʣ�ÿ�ο���������̨�ϵ���Ӱ�������Ҹе��ޱȵ��˷ܺ��Ժ���������α����Լ������״̬�������ڴ�������𺳵��ݳ����أ�', title: '�ݳ������״̬�����ݳ�', id: '2024_3_30_10_50_59_579.mp4' },
    { text: '�ٸ磬���Ĵ���Ʒζ������ôʱ�У�����������ʱ����ʲô�����ļ�����', title: 'ʱ�м����봩��Ʒζ', id: '2024_3_30_10_50_59_582.mp4' },
    { text: '�ٸ磬���ڡ�����էй���еı��ݷǳ��󵨺�ϸ�壬������ο˷������ϰ���ȥ��������һ����ɫ���أ�', title: '������էй����ɫ������·', id: '2024_3_30_10_50_59_584.mp4' },
    { text: '�ٸ磬���Ĵ��ڶ�����˵��������һ��ż�񣬸����������е�һ���⡣��������ʲô���������Щ��˿˵����', title: '�Է�˿����ֿ����', id: '2024_3_30_10_50_59_587.mp4' },
    { text: '�ٸ磬���Ĵ�����ҵ�����ǿ��������Ĵ󰮡�������Ϊʲô��ѡ�������ƣ��������˵��ζ��ʲô��', title: '������ҵ���֮��', id: '2024_3_30_10_50_59_590.mp4' },
    { text: '�ٸ磬���ĸ���������ô��������ˣ�����������α����Լ���ɤ�ӵģ���û��ʲô�ر���ؾ���', title: '�����������ؾ�', id: '2024_3_30_10_50_59_593.mp4' },
    { text: '�ٸ磬��������Ȧ�о����˺ܶ࣬�и߳�Ҳ�е͹ȡ�����������α����Լ�����̬���������ĸ���Ӱ�������ŵ��أ�', title: '����Ȧ��̬����֮��', id: '2024_3_30_10_50_59_595.mp4' },
    { text: '�ٸ磬�������ֺ͵�Ӱ��Ʒ�������ྭ��֮��������������ο�������ʹ��µĹ�ϵ�ģ�', title: '�����봴�£�����������', id: '2024_3_30_10_50_59_597.mp4' },
    { text: '�ٸ磬����������ҵ��ȡ���˾޴�ĳɹ�����������ʲô�������׷�������������˵����', title: '��׷������Ĺ����뽨��', id: '2024_3_30_10_50_59_600.mp4' },
    { text: '�ٸ磬��������������Զ������ģ���������ʲô���������Щ��˿˵����', title: '�Է�˿���������', id: '2024_3_30_10_50_59_602.mp4' }
];

var actionListStore = [];

//video.on('ended', function () {
//    video[0].play();
//})


var func = function (i) {
    if (buttonList.length > maxbuttonlimit) {
        setTimeout(function () { func(i); }, 3000);
        return;
    }
    var item = actionList.pop();
    if (!item) {
        // setTimeout(function () { func(i); }, 3000);
        return;
    }
    var text = item['text'];
    var title = item['title'];
    var vid = item['id'];

    if (title && title.length > 0) {

        var button = dropNewButton(title, video, buttonList.length);
        if (title.length == 0) {
            button.css('display', 'none');
        }

        button.click(function (ele) {
            // alert($(this).text());
            //removeButton($(this), video, buttonList);
            clearButton();
            setSlideTopBar("\"" + text + "\"", video, vid, true, 2000, afterslidefunc);
            // showTopBar("\"" + text + "\"", video, vid);
            playNode(vid, true);
            // video.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&videoid=" + vId);
        });
        buttonList.push(button);

        bindtooltip(button, text);
    }
    setTimeout(function () { func(i + 1); }, 3000);

}


var play = function (callback) {
    var req = '/Immortal/GetVideoFile' //?packageid=' + escape(packageId) + "&nodeid=" + escape(currentNode) + "&context=" + JSON.stringify(context);
    // alert(req);
    $.ajax({
        url: req, // �滻Ϊ���API�˵�
        type: 'POST', // �������ͣ�������GET��POST��
        dataType: 'text', // �����ӷ��������ص���������
        data: {
            packageid: escape(packageId),
            nodeid: escape(currentNode),
            context: JSON.stringify(context)
        },
        success: function (response) {
            // alert(response);
            respJS = JSON.parse(response);
            // ����ɹ�ʱ�Ļص�����
            callback(respJS);
        },
        error: function (xhr, status, error) {
            // ����ʧ��ʱ�Ļص�����
            console.error('Error:', error);
        }
    });

}

var preplay = function (nodeid) {
    context.lastnode = currentNode;
    currentNode = nodeid;

    var textboxinput = $('#tb_textinput');
    context.promptText = textboxinput.val();

}

var sendPlayingNode = function (endpointid, platform, roomid, productid, nodeid) {
    var req = '/Immortal/SendCurrentNode?endpointid=' + endpointid + '&platform=' + platform + '&roomid=' + roomid + '&productid=' + productid + '&nodeid=' + nodeid;
    // alert(req);
    $.ajax({
        url: req, // �滻Ϊ���API�˵�
        type: 'GET', // �������ͣ�������GET��POST��
        dataType: 'text', // �����ӷ��������ص���������
        success: function (response) {
            if (response.toLowerCase() != 'true') {
                alert("send node log failed: " + response);
            }
        },
        error: function (xhr, status, error) {
            // ����ʧ��ʱ�Ļص�����
            console.error('Error:', error);
        }
    });
}

var listenfunc = function (uselasttime) {
    var actions = extractActionList();
    // var textbox_input_val = $('#tb_textinput').val().trim();
    var customText = isActionNode() ? "true" : "false";
    var vid = video;
    var evt = 'ended';
    if (uselasttime) {
        // alert('extend last time');
        vid = null;
        evt = null;
    }
    listenStream(JSON.stringify(actions), customText, config.danmu_listentimemili, vid, evt, function (steamdata) {
        var streamdataobj = steamdata;
        var decision = streamdataobj.index;
        if (decision.index < 0) {
            //alert('no decision.');
            // no available decision, continue listening
            listenfunc(true);
        }
        else {
            var decisiontext = streamdataobj.text;
            var button = grepButtonByText(decisiontext);
            // alert(JSON.stringify(streamdataobj));
            if (button) {
                button.trigger('click');
            }
            else {
                // alert('no button..');
                listenfunc(true);
            }
        }
    }, uselasttime);
};

var afterslidefunc = function () {
    var endpointid = $('#endpoint_id').val();
    var platformid = $('#platform_id').val();
    var roomid = $('#room_id').val();
    sendPlayingNode(endpointid, platformid, roomid, id, currentNode);
    if (config.enableListenDanmu && context.AutoPass != "True") {
        // alert('listen');
        listenfunc();
    }
    func(0);
}
var playNode = function (nodeid, waitSignal) {
    preplay(nodeid);
    play(function (respJS) {
        // alert(JSON.stringify(respJS));
        updateStateByResponse(respJS, waitSignal, afterslidefunc);
    });
}

var extractActionList = function (respJS) {
    return { "data": actionListStore };
}

var rebindSubmitButton = function (actionNodeId) {
    var submitbutton = $('#video_action_button');
    var textboxinput = $('#tb_textinput');
    submitbutton.off('click');
    submitbutton.on('click', function () {
        var textval = textboxinput.val().trim();
        if (textval.length == 0) {
            showTopBar("���벻��Ϊ�ա�");
            return;
        }
        clearButton();
        context.Question = escape(textval);
        setSlideTopBar("\"" + textval + "\"", video, actionNodeId, true, 2000, afterslidefunc);
        playNode(actionNodeId, true);
    });
}

var updateStateByResponse = function (respJS, waitSignal, callbackAction) {
    // alert(JSON.stringify(respJS.node));
    var nodeid = respJS.node.ID;
    currentNode = nodeid;
    var coxt = respJS.context;
    context = coxt;
    var actionlist = respJS.nextlist.data;
    actionList = [];
    actionListStore = [];
    var defaultnextid;
    for (var i = 0; i < actionlist.length; i++) {
        var action = actionlist[i];
        var newitem = {
            text: action.Question,
            title: action.Title,
            id: action.ID
        }
        if (i == 0) {
            defaultnextid = action.ID;
        }
        actionList.push(newitem);
        actionListStore.push(newitem);
    }

    updatedebugbox(JSON.stringify(respJS.node), JSON.stringify(actionlist), JSON.stringify(coxt));

    rebindSubmitButton(currentNode);

    // override video to play
    var videoid = respJS.node.VideoDataKey;
    if (respJS.node.Data && respJS.node.Data.playvideo && respJS.node.Data.playvideo.length > 0) {
        // alert(respJS.node.Data.playvideo);
        videoid = respJS.node.Data.playvideo;
    }
    video.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&videoid=" + videoid);

    if (waitSignal) {
        video.one("canplaythrough", function () {
            loadedState = true;
            var waitmilisec = 1000;
            if (slidechecked && !slided) {
                slideTopBar(true, waitmilisec, callbackAction);
                // video.off('canplaythrough');
                slided = true;
                //setTimeout(function () {
                //    video[0].play();
                //}, waitmilisec);
            }
        });
    }
    else {
        var playthroughFunc = function () {
            video[0].play();
            // video.off('canplaythrough');
            callbackAction();
        }
        video.one("canplaythrough", playthroughFunc);
    }
    // bgmAudio.attr('src', '/Immortal/GetVideo?packageid=' + packageId + "&audioid=" + )
    // alert(context);
    handleActions(context, defaultnextid);
}

var updatedebugbox = function (nodeid, actionlist, context) {
    // alert(nodeid);
    debugbox_nodeid.text(nodeid);
    debugbox_nextlist.text(actionlist);
    debugbox_context.text(context);
}

var isActionNode = function () {
    return context.NodeType == "Action";
}

var handleActions = function (context, defaultnextid) {
    if (context.BGMusicKey) {
        playBGM(context.BGMusicKey);
    }
    if (context.AutoPass) {
        autoPass(context.AutoPass, defaultnextid);
    }

    var tb_input = $('#tb_textinput');
    tb_input.val('');
    if (context.NodeType) {
        if (isActionNode()) {
            showTextboxInput();
        }
        else {
            hideTextboxInput();
        }
    }
    else {
        hideTextboxInput();
    }
}

var autoPass = function (val, nextnodeid) {
    if (val == 'True' && nextnodeid && nextnodeid.length > 0) {
        video.one("ended", function () {
            // action = actionList[0];
            clearButton();
            playNode(nextnodeid);
        });
    }
    //else if (val == 'False') {
    //    video.off("ended");
    //}
}

var playBGM = function (audioid) {
    if (audioid == bgmid) {
        return;
    }
    bgmid = audioid
    if (bgmid == "") {
        bgmAudio.removeAttr('src');
    }
    else {
        bgmAudio.attr('src', '/Immortal/GetAudio?packageid=' + packageId + "&audioid=" + bgmid);
        bgmAudio[0].play();
        bgmAudio[0].volume = 0.2;
    }
}

var playClick = function () {
    playNode('');
}

module.exports = {
  playClick: playClick
}