var Pit = cc.Node.extend({
    roleSprite:null,
    ghostSprite:null,
    actionLabel:null,
    popStars:null,
    roleFace:null,
    ghostFace:null,
    showType:"role",
    status:"sleep",

    init:function () {
        this._super();

        this.roleSprite = cc.Sprite.create("res/main/jige.png");
        this.roleSprite.setAnchorPoint(0.5, 0);
        this.roleSprite.setPosition(0, -208);
        this.roleSprite.setVisible(false);
        this.addChild(this.roleSprite, 1);

        this.roleFace = cc.Sprite.create("res/main/jigeCry.png");
        this.roleFace.setPosition(136, 102);
        this.roleFace.setVisible(false);
        this.roleSprite.addChild(this.roleFace, 2);

        this.ghostSprite = cc.Sprite.create("res/main/ghost.png");
        this.ghostSprite.setAnchorPoint(0.5, 0);
        this.ghostSprite.setPosition(0, -208);
        this.ghostSprite.setVisible(false);
        this.addChild(this.ghostSprite, 1);

        this.ghostFace = cc.Sprite.create("res/main/ghostCry.png");
        this.ghostFace.setPosition(107, 129);
        this.ghostFace.setVisible(false);
        this.ghostSprite.addChild(this.ghostFace, 2);

        this.actionLabel = cc.LabelTTF.create("", "Arial", 40);
        this.actionLabel.setPosition(0, 100);
        this.actionLabel.setColor(cc.c3b(255, 0, 0));
        this.actionLabel.setVisible(false);
        this.addChild(this.actionLabel, 10);

        this.popStars = cc.Sprite.create("res/main/popStars.png");
        this.popStars.setPosition(70, 209);
        this.popStars.setVisible(false);
        this.addChild(this.popStars, 0);
    },

    canHit:function () {
        return (this.status == "show") || (this.status == "hold") || (this.status == "hide");
    },

    currentSprite:function () {
        if (this.showType == "ghost") {
            return this.ghostSprite;
        } else {
            return this.roleSprite;
        }
    },

    showRole:function (type) {
        this.showType = type;
        this.enterShowStatus();
    },

    hitRole:function () {
        this.status = "hitting";
        this.currentSprite().stopAllActions();
        var pos = this.currentSprite().getPosition();

        this.actionLabel.stopAllActions();
        this.popStars.setVisible(true);
        if (this.showType == "ghost") {
            this.ghostFace.setVisible(true);
            this.popStars.setPosition(70, 209 + pos.y);

            this.actionLabel.setPosition(0, 150 + pos.y);
            this.actionLabel.setOpacity(255);
            this.actionLabel.setColor(cc.c3b(255, 0, 0));
            this.actionLabel.setString("-" + config.GhostReduceTime + "s");

            var sAction1 = cc.Show.create();
            var sAction2 = cc.MoveTo.create(0.5, cc.p(0, 250 + pos.y));
            var sAction3 = cc.FadeOut.create(0.5);
            var sAction4 = cc.Spawn.create(sAction2, sAction3);
            var sAction5 = cc.Hide.create();
            this.actionLabel.runAction(cc.Sequence.create(sAction1, sAction4, sAction5));
        } else {
            this.roleFace.setVisible(true);
            this.popStars.setPosition(28, 211 + pos.y);

            this.actionLabel.setPosition(0, 150 + pos.y);
            this.actionLabel.setOpacity(255);
            this.actionLabel.setColor(cc.c3b(0, 0, 0));
            this.actionLabel.setString("+1");

            var sAction1 = cc.Show.create();
            var sAction2 = cc.MoveTo.create(0.5, cc.p(0, 250 + pos.y));
            var sAction3 = cc.FadeOut.create(0.5);
            var sAction4 = cc.Spawn.create(sAction2, sAction3);
            var sAction5 = cc.Hide.create();
            this.actionLabel.runAction(cc.Sequence.create(sAction1, sAction4, sAction5));
        }

        var action1 = cc.MoveTo.create(0.05, cc.p(pos.x - 5, pos.y));
        var action2 = cc.MoveTo.create(0.1, cc.p(pos.x + 5, pos.y));
        var action3 = cc.MoveTo.create(0.1, cc.p(pos.x - 5, pos.y));
        var action4 = cc.MoveTo.create(0.05, pos);
        var action5 = cc.CallFunc.create(this.enterSleepStatus, this);
        this.currentSprite().runAction(cc.Sequence.create(action1, action2, action3, action4, action5));
    },

    enterShowStatus:function () {
        this.status = "show";
        var action1 = cc.Show.create();
        var action2 = cc.MoveTo.create(0.2, cc.p(0, 0));
        var action3 = cc.CallFunc.create(this.enterHoldStatus, this);
        this.currentSprite().runAction(cc.Sequence.create(action1, action2, action3));
    },

    enterHoldStatus:function () {
        this.status = "hold";
        var action1 = cc.DelayTime.create(Math.random() * 1.3);
        var action2 = cc.CallFunc.create(this.enterHideStatus, this);
        this.currentSprite().runAction(cc.Sequence.create(action1, action2));
    },

    enterHideStatus:function () {
        this.status = "hide";
        var action1 = cc.MoveTo.create(0.2, cc.p(0, -208));
        var action2 = cc.CallFunc.create(this.enterSleepStatus, this);
        this.currentSprite().runAction(cc.Sequence.create(action1, action2));
    },

    enterSleepStatus:function () {
        this.status = "sleep";
        this.roleSprite.setPosition(0, -208);
        this.roleSprite.setVisible(false);
        this.ghostSprite.setPosition(0, -208);
        this.ghostSprite.setVisible(false);
        this.popStars.setVisible(false);
        this.roleFace.setVisible(false);
        this.ghostFace.setVisible(false);
    }
});

var MoleLayer = cc.Layer.extend({
    num:0,
    countDown:config.CountDown,
    showCountDown:config.CountDown,
    nextPopTime:config.CountDown,
    numLabel:null,
    timeLabel:null,
    resultLabel:null,
    timeMask:null,
    readyLayer:null,
    pits:[],
    gameStatus:"run",

    init:function () {
        this._super();

        this.nextPopTime = this.nextPopTime - 0.2 - 0.2 * Math.random();

        var bg1 = cc.Sprite.create("res/main/bg1.png");
        bg1.setAnchorPoint(0, 0);
        bg1.setPosition(0, 529);
        this.addChild(bg1, 10);

        var bg2 = cc.Sprite.create("res/main/bg2.png");
        bg2.setAnchorPoint(0, 0);
        bg2.setPosition(0, 396);
        this.addChild(bg2, 20);

        var bg3 = cc.Sprite.create("res/main/bg3.png");
        bg3.setAnchorPoint(0, 0);
        bg3.setPosition(0, 260);
        this.addChild(bg3, 30);

        var bg4 = cc.Sprite.create("res/main/bg4.png");
        bg4.setAnchorPoint(0, 0);
        bg4.setPosition(0, 0);
        this.addChild(bg4, 40);

        var top = cc.Sprite.create("res/main/top.png");
        top.setPosition(320, 969);
        this.addChild(top, 1000);

        var timeBar = cc.Sprite.create("res/main/barBg.png");
        timeBar.setPosition(266, 840);
        this.addChild(timeBar, 50);

        this.timeMask = cc.Sprite.create("res/main/barMask.png");
        this.timeMask.setAnchorPoint(1, 0.5);
        this.timeMask.setPosition(464, 840);
        this.addChild(this.timeMask, 51);

        var timeCover = cc.Sprite.create("res/main/barCover.png");
        timeCover.setPosition(266, 838);
        this.addChild(timeCover, 52);

        var timeCircleBg = cc.Sprite.create("res/main/timeBg.png");
        timeCircleBg.setPosition(564, 839);
        this.addChild(timeCircleBg, 53);

        this.timeLabel = cc.Sprite.create("res/main/10.png");
        this.timeLabel.setPosition(564, 840);
        this.addChild(this.timeLabel, 54);

        this.resultLabel = cc.LabelTTF.create("", "Arial", 30);
        this.resultLabel.setPosition(164, 450);
        this.resultLabel.setColor(cc.c3b(0, 0, 0));
        this.resultLabel.setVisible(false);
        this.addChild(this.resultLabel);

        for (var i = 0; i < 3; i++) {
            this.pits[i] = [];
            for (var j = 0; j < 3; j++) {
                var pitNode = new Pit()
                pitNode.init();
                pitNode.setPosition(114 + 195 * j, 257 + 137 * i);
                this.addChild(pitNode, 30 - 10 * i);
                this.pits[i][j] = pitNode;
            };
        };

        this.numLabel = cc.LabelTTF.create(this.num.toString(), "Arial", 38);
        this.numLabel.setPosition(24, 0);
        this.numLabel.setAnchorPoint(0.5, 0);
        this.numLabel.setColor(cc.c3b(0, 0, 0));
        this.addChild(this.numLabel, 24);

        this.readyLayer = new ReadyLayer();
        this.readyLayer.init();
        this.addChild(this.readyLayer, 100);

        var showGo = function () {
            var action1 = cc.Show.create();
            var action2 = cc.DelayTime.create(1);
            var action3 = cc.Hide.create();
            var action4 = cc.CallFunc.create(this.startGame, this);
            this.readyLayer.goSprite.runAction(cc.Sequence.create(action1, action2, action3, action4));
        };

        var showReady = function () {
            this.readyLayer.tipTxt.setVisible(false);
            this.readyLayer.readySprite.setVisible(true);
            var action1 = cc.ScaleTo.create(0.3, 1);
            var action2 = cc.DelayTime.create(1);
            var action3 = cc.ScaleTo.create(0.3, 0);
            var action4 = cc.Hide.create();
            var action5 = cc.CallFunc.create(showGo, this);
            this.readyLayer.readySprite.runAction(cc.Sequence.create(action1, action2, action3, action4, action5));
        };

        var action1 = cc.DelayTime.create(2);
        var action2 = cc.FadeOut.create(0.3);
        var action3 = cc.CallFunc.create(showReady, this);
        this.readyLayer.tipTxt.runAction(cc.Sequence.create(action1, action2, action3));

        return true;
    },

    startGame:function () {
        this.removeChild(this.readyLayer, true);
        this.readyLayer = null;

        this.schedule(this.updateLogic, 0);

        this.setTouchEnabled(true);
    },

    updateLogic:function (dt) {
        if (this.countDown <= 0 || this.gameStatus != "run") {
            return;
        }

        this.countDown = this.countDown - dt;
        var width = (10 - this.countDown) * 400 / config.CountDown;
        this.timeMask.setTextureRect(cc.rect(0, 0, Math.floor(width), 59));

        var second = Math.ceil(this.countDown);

        if (this.showCountDown != second) {
            this.showCountDown = second;
            if (this.countDown <= 0) {
                if (this.gameStatus == "run") {
                    this.gameStatus = "stop";
                    this.handleResult(false);
                }
                this.countDown = 0;
                second = 0;
                this.showCountDown = 0;
            }
            var texture = cc.TextureCache.getInstance().addImage("res/main/" + this.showCountDown + ".png");
            var size = texture.getContentSize();
            var rect = cc.rect(0, 0, size.width, size.height);
            this.timeLabel.initWithTexture(texture, rect);
        }

        if (this.countDown <= this.nextPopTime) {
            this.nextPopTime = this.nextPopTime - 0.2 - 0.2 * Math.random();

            // var n = Math.round(Math.random()*100)%2 + 1;
            var n = 1;
            var lastA;
            var lastB;
            for (var i = 0; i < n; i++) {
                var a = Math.round(Math.random()*100)%3;
                var b = Math.round(Math.random()*100)%3;
                if (i > 0) {
                    while (lastA == a && lastB == b) {
                        a = Math.round(Math.random()*100)%3;
                        b = Math.round(Math.random()*100)%3;
                    }
                }
                if (this.pits[a][b].status == "sleep") {
                    if (Math.random() < config.JiGeOutProbability) {
                        this.pits[a][b].showRole("role");
                    } else {
                        this.pits[a][b].showRole("ghost");
                    }
                }
                lastA = a;
                lastB = b;
            };
        }
    },

    handleResult:function (win) {
        this.setTouchEnabled(false);

        if (win) {
            window.location.href = 'TXwud/index.html';
        } else {
            var resultLayer = new ResultLayer();
            resultLayer.init(win);
            resultLayer.setPosition(0, 1136);
            this.addChild(resultLayer, 200);

            var action1 = cc.MoveTo.create(0.3, cc.p(0, -50));
            var action2 = cc.MoveTo.create(0.05, cc.p(0, 0));
            var resetEditBox = function () {
                resultLayer.setTouchEnabled(true);

                if (resultLayer.inputPhone != null) {
                    resultLayer.inputPhone.setPosition(235, 409);
                    resultLayer.inputPhone.setTouchEnabled(true);
                }
            };
            var action3 = cc.CallFunc.create(resetEditBox, resultLayer);
            resultLayer.runAction(cc.Sequence.create(action1, action2, action3));
        }
    },

    onTouchesBegan:function (touches, event) {
        if (touches && this.gameStatus == "run") {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    var pit = this.pits[i][j];
                    if (pit.canHit()) {
                        var pos = pit.convertToNodeSpace(touches[0].getLocation());
                        var spPos = pit.currentSprite().getPosition();
                        if (spPos.y > -190) {
                            var box = cc.rect(-70, 0, 140, spPos.y + 208);
                            if (cc.rectContainsPoint(box, pos)) {
                                this.num++;
                                this.numLabel.setString(this.num.toString());
                                pit.hitRole();
                                if (pit.showType == "ghost") {
                                    cc.AudioEngine.getInstance().playEffect("res/ghost.wav");
                                    this.countDown = this.countDown - config.GhostReduceTime;
                                    this.nextPopTime = this.nextPopTime - config.GhostReduceTime;

                                    if (this.countDown <= 0) {
                                        this.gameStatus = "stop";
                                        this.timeMask.setTextureRect(cc.rect(0, 0, 400, 59));

                                        var texture = cc.TextureCache.getInstance().addImage("res/main/0.png");
                                        var size = texture.getContentSize();
                                        var rect = cc.rect(0, 0, size.width, size.height);
                                        this.timeLabel.initWithTexture(texture, rect);

                                        this.handleResult(false);
                                    }
                                } else {
                                    // cc.AudioEngine.getInstance().playEffect("res/jige.wav");
                                    if (this.num >= config.TargetCount) {
                                        if (Math.random() < config.KeyProbability) {
                                            this.gameStatus = "getKey";
                                            this.handleResult(true);
                                        }   
                                    }
                                }
                                return;
                            }
                        }
                    }
                };
            };
        }
    },

    onTouchesMoved:function (touches, event) {
    },

    onTouchesEnded:function (touches, event) {
    },

    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }
});

var MoleScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MoleLayer();
        layer.init();
        this.addChild(layer);
    }
});

