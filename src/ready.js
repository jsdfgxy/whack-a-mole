var ReadyLayer = cc.Layer.extend({
    tip1:null,
    tip2:null,
    tipTxt:null,
	readySprite:null,
	goSprite:null,

    init:function () {
        this._super();

        this.tip1 = cc.Sprite.create("res/main/tip1.png");
        this.tip1.setPosition(320, 593);
        this.addChild(this.tip1);

        this.tip2 = cc.Sprite.create("res/main/tip2.png");
        this.tip2.setPosition(511, 313);
        this.addChild(this.tip2);

        this.tipTxt = cc.Sprite.create("res/main/tipTxt.png");
        this.tipTxt.setPosition(320, 684);
        this.addChild(this.tipTxt);

        this.readySprite = cc.Sprite.create("res/main/ready.png");
        this.readySprite.setPosition(329, 680);
        this.readySprite.setVisible(false);
        this.readySprite.setScale(0);
        this.addChild(this.readySprite, 1);

        this.goSprite = cc.Sprite.create("res/main/go.png");
        this.goSprite.setPosition(319, 687);
        this.goSprite.setVisible(false);
        this.addChild(this.goSprite, 2);

        this.setAnchorPoint(0, 0);

        return true;
    }
});