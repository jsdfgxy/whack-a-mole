var ResultLayer = cc.Layer.extend({
	result:false,
	button1:null,
	button2:null,
	button3:null,
	selectButton:null,
    buttonScaled:false,
    inputPhone:null,

    init:function (result) {
        this._super();

        this.result = result;

        this.setAnchorPoint(0, 0);

        var bg = cc.Sprite.create("res/main/resultBg.png");
        bg.setPosition(332, 641);
        this.addChild(bg, 0);

        var fox = cc.Sprite.create("res/main/fox.png");
        this.addChild(fox, 1);

        if (result) {
        	fox.setPosition(463, 653);

        	var txt = cc.Sprite.create("res/main/winTxt.png");
        	txt.setPosition(250, 639);
        	this.addChild(txt, 2);

        	var line = cc.Sprite.create("res/main/line.png");
        	line.setPosition(325, 560);
        	this.addChild(line, 3);

        	var inputTip = cc.Sprite.create("res/main/inputTip.png");
        	inputTip.setPosition(326, 491);
        	this.addChild(inputTip, 4);

        	var inputBg = cc.Sprite.create("res/main/inputBg.png");
        	inputBg.setPosition(222, 407);
        	this.addChild(inputBg, 5);

            var sp = cc.Scale9Sprite.create("res/main/inputBg.png", cc.rect(0, 0, 233, 47), cc.RectZero());
            this.inputPhone = cc.EditBox.create(cc.size(210, 30), sp);
            this.inputPhone.setFont("Arial", 24);
            this.inputPhone.setPlaceHolder("请输入手机号码");
            this.inputPhone.setFontColor(cc.c3b(0, 0, 0));
            this.inputPhone.setPlaceholderFont("Arial", 24);
            this.inputPhone.setPlaceholderFontColor(cc.c3b(0, 0, 0));
            this.inputPhone.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
            this.inputPhone.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
            this.inputPhone.setPosition(235, 409);
            this.inputPhone.setTouchEnabled(false);
            this.addChild(this.inputPhone, 6);

        	this.button1 = cc.Sprite.create("res/main/winBtn1.png");
        	this.button1.setPosition(448, 405);
        	this.addChild(this.button1, 8);

        	this.button2 = cc.Sprite.create("res/main/winBtn2.png");
        	this.button2.setPosition(327, 306);
        	this.addChild(this.button2, 8);
        } else {
        	fox.setPosition(463, 647);

        	var txt = cc.Sprite.create("res/main/loseTxt.png");
        	txt.setPosition(255, 639);
        	this.addChild(txt, 2);

        	this.button1 = cc.Sprite.create("res/main/loseBtn1.png");
        	this.button1.setPosition(332, 509);
        	this.addChild(this.button1, 3);

        	this.button2 = cc.Sprite.create("res/main/loseBtn2.png");
        	this.button2.setPosition(332, 407);
        	this.addChild(this.button2, 3);

        	this.button3 = cc.Sprite.create("res/main/loseBtn3.png");
        	this.button3.setPosition(332, 306);
        	this.addChild(this.button3, 3);
        }

        return true;
    },

    onTouchesBegan:function (touches, event) {
    	this.selectButton = null;
        if (touches) {
            var pos = this.convertToNodeSpace(touches[0].getLocation());
            if (cc.rectContainsPoint(this.button1.getBoundingBox(), pos)) {
                this.selectButton = this.button1;
                this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
                this.buttonScaled = true;
                return;
            }
            if (cc.rectContainsPoint(this.button2.getBoundingBox(), pos)) {
                this.selectButton = this.button2;
                this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
                this.buttonScaled = true;
                return;
            }
            if (this.button3 != null) {
	            if (cc.rectContainsPoint(this.button3.getBoundingBox(), pos)) {
	                this.selectButton = this.button3;
	                this.selectButton.runAction(cc.ScaleTo.create(0.1, 1.05));
	                this.buttonScaled = true;
	                return;
	            }
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
                if (this.selectButton == this.button1) {
                    if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                    	if (this.result) {
                    		wantKeyCallback(this.inputPhone.getText());
                    	} else {
                    		resetGameCallback();
                    	}
                    }
                }
                else if (this.selectButton == this.button2) {
                    if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                        if (this.result) {
                        	downloadGameCallback();
                        } else {
                        	shareWithFriendCallback();
                        }
                    }
                }
                else if (this.selectButton == this.button3) {
                    if (cc.rectContainsPoint(this.selectButton.getBoundingBox(), pos)) {
                        downloadGameCallback();
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