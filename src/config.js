var config = config || {};

//是否有欢迎页面
config.HasWelcome = true;
//总倒计时（秒）
config.CountDown = 10;
//总共需要打中多少个玑哥后才能开始触发概率
config.TargetCount = 10;
//获取激活码的概率
config.KeyProbability = 0.1;
//砸到鬼后减少的时间（秒）
config.GhostReduceTime = 1;
//从洞中出来玑哥的概率
config.JiGeOutProbability = 0.7;

//点击“武斗”按钮函数回调
var wudouCallback = function () {
	cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1, new MoleScene(), cc.c3b(255, 255, 255)));
};

//点击“文斗”按钮函数回调
var wendouCallback = function () {
	cc.log("文斗");
};

//点击“我要激活码”按钮函数回调
var wantKeyCallback = function (iphoneNumber) {
	if (!validPhone(iphoneNumber)) {
            alert("手机号码有误，请填写正确！");
        } else {
            collectPho("txhd", iphoneNumber, window.location.href);
        }
	//cc.log("我要激活码" + iphoneNumber);
};

//点击“下载游戏”或者“天下HD下载”按钮函数回调
var downloadGameCallback = function () {
	cc.log("下载游戏");
};

//点击“我不服 从头再来”按钮函数回调
var resetGameCallback = function () {
	cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1, new MoleScene(), cc.c3b(255, 255, 255)));
};

//点击“分享好友 场外求助”按钮函数回调
var shareWithFriendCallback = function () {
	cc.log("分享好友 场外求助");
};

//2014.7.9添加功能
//验证手机号码
function validPhone(num) {
        if (/^(13|14|15|18)\d{9}$/.test(num)) {
            return true;
        } else {
            return false;
        }
    }
//发送验证码
function collectPho(game_name, phone, src) {
        var os = 'ios';
        if (/android/i.test(navigator.userAgent.toLowerCase())) {
            os = 'android';
        }
        $.ajax({
            url: "http://mobile-game-appoint.webapp.163.com/appoint/" + game_name + "/" + phone + "/" + os + "/?src=" + src,
            async: false,
            dataType: "jsonp",
            success: function (result) {
                if (result.status == "ok") {
                    alert("验证码发送成功，请注意短信！");
                } else {
                    alert(result.status);
                }
            }
        });
    }