var WelcomeLayer = cc.Layer.extend({
    wudouButton:null,
    wendouButton:null,
    selectButton:null,
    buttonScaled:false,

    init:function () {
        this._super();

        var bgSprite = cc.Sprite.create("res/welcome/bg.png");
        bgSprite.setAnchorPoint(0, 0);
        this.addChild(bgSprite, 0);

        this.wudouButton = cc.Sprite.create("res/welcome/wudou.png");
        this.wudouButton.setPosition(328, 562);
        this.addChild(this.wudouButton, 1);

        this.wendouButton = cc.Sprite.create("res/welcome/wendou.png");
        this.wendouButton.setPosition(328, 422);
        this.addChild(this.wendouButton, 1);

        var rope = cc.Sprite.create("res/welcome/rope.png");
        rope.setPosition(329, 648);
        this.addChild(rope, 2);

        var title = cc.Sprite.create("res/welcome/title.png");
        title.setPosition(338, 760);
        this.addChild(title, 3);

        this.setTouchEnabled(true);

        cc.AudioEngine.getInstance().preloadEffect("res/jige.wav");
        cc.AudioEngine.getInstance().preloadEffect("res/ghost.wav");
        return true;
    },

    onTouchesBegan:function (touches, event) {
        this.selectButton = null;
        if (touches) {
            var pos = this.convertToNodeSpace(touches[0].getLocation());
            if (cc.rectContainsPoint(this.wudouButton.getBoundingBox(), pos)) {
                this.selectButton = this.wudouButton;
                this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
                this.buttonScaled = true;
                return;
            }
            if (cc.rectContainsPoint(this.wendouButton.getBoundingBox(), pos)) {
                this.selectButton = this.wendouButton;
                this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
                this.buttonScaled = true;
                return;
            }
        }
    },

    onTouchesMoved:function (touches, event) {
        if (touches) {
            if (this.selectButton != null) {
                var pos = this.convertToNodeSpace(touches[0].getLocation());
                if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                    if (this.buttonScaled == false) {
                        this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
                        this.buttonScaled = true;
                    }
                }
                else {
                    if (this.buttonScaled == true) {
                        this.selectButton.runAction(cc.ScaleTo.create(0.1, 1));
                        this.buttonScaled = false;
                    }
                }
            }
        }
    },

    onTouchesEnded:function (touches, event) {
        if (touches) {
            if (this.selectButton != null) {
                var pos = this.convertToNodeSpace(touches[0].getLocation());
                if (this.selectButton == this.wudouButton) {
                    if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                        wudouCallback();
                    }
                }
                else if (this.selectButton == this.wendouButton) {
                    if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                        wendouCallback();
                    }
                }
                if (this.buttonScaled == true) {
                    this.selectButton.runAction(cc.ScaleTo.create(0.1, 1));
                }
            }
        }
        this.selectButton = null;
        this.buttonScaled = false;
    },

    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }
});

var WelcomeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new WelcomeLayer();
        layer.init();
        this.addChild(layer);
    }
});

