/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * resource type
 * @constant
 * @type Object
 */
cc.RESOURCE_TYPE = {
    "IMAGE": ["png", "jpg", "bmp", "jpeg", "gif"],
    "SOUND": ["mp3", "ogg", "wav", "mp4", "m4a"],
    "XML": ["plist", "xml", "fnt", "tmx", "tsx"],
    "BINARY": ["ccbi"],
    "FONT": "FONT",
    "TEXT": ["txt", "vsh", "fsh", "json", "ExportJson"],
    "UNKNOW": []
};

/**
 * resource structure
 * @param resList
 * @param selector
 * @param target
 * @constructor
 */
cc.ResData = function (resList, selector, target) {
    this.resList = resList || [];
    this.selector = selector;
    this.target = target;
    this.curNumber = 0;
    this.loadedNumber = 0;
    this.totalNumber = this.resList.length;
};

/**
 * A class to preload resources async
 * @class
 * @extends cc.Class
 */
cc.Loader = cc.Class.extend(/** @lends cc.Loader# */{
    _curData: null,
    _resQueue: null,
    _isAsync: false,
    _scheduler: null,
    _running: false,
    _regisiterLoader: false,

    /**
     * Constructor
     */
    ctor: function () {
        this._scheduler = cc.Director.getInstance().getScheduler();
        this._resQueue = [];
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} selector
     * @param {Object} target
     */
    initWithResources: function (resources, selector, target) {
        if (!resources) {
            cc.log("cocos2d:resources should not null");
            return;
        }
        var res = resources.concat([]);
        var data = new cc.ResData(res, selector, target);
        this._resQueue.push(data);

        if (!this._running) {
            this._running = true;
            this._curData = this._resQueue.shift();
            this._scheduler.scheduleUpdateForTarget(this);
        }
    },

    setAsync: function (isAsync) {
        this._isAsync = isAsync;
    },

    /**
     * Callback when a resource file loaded.
     */
    onResLoaded: function (err) {
        if(err != null){
            cc.log("cocos2d:Failed loading resource: " + err);
        }

        this._curData.loadedNumber++;
    },

    /**
     * Get loading percentage
     * @return {Number}
     * @example
     * //example
     * cc.log(cc.Loader.getInstance().getPercentage() + "%");
     */
    getPercentage: function () {
        var percent = 0, curData = this._curData;
        if (curData.totalNumber == 0) {
            percent = 100;
        }
        else {
            percent = (0 | (curData.loadedNumber / curData.totalNumber * 100));
        }
        return percent;
    },

    /**
     * release resources from a list
     * @param resources
     */
    releaseResources: function (resources) {
        if (resources && resources.length > 0) {
            var sharedTextureCache = cc.TextureCache.getInstance(),
                sharedEngine = cc.AudioEngine ? cc.AudioEngine.getInstance() : null,
                sharedParser = cc.SAXParser.getInstance(),
                sharedFileUtils = cc.FileUtils.getInstance();

            var resInfo, path, type;
            for (var i = 0; i < resources.length; i++) {
                resInfo = resources[i];
                path = typeof resInfo == "string" ? resInfo : resInfo.src;
                type = this._getResType(resInfo, path);

                switch (type) {
                    case "IMAGE":
                        sharedTextureCache.removeTextureForKey(path);
                        break;
                    case "SOUND":
                        if (!sharedEngine) throw "Can not find AudioEngine! Install it, please.";
                        sharedEngine.unloadEffect(path);
                        break;
                    case "XML":
                        sharedParser.unloadPlist(path);
                        break;
                    case "BINARY":
                        sharedFileUtils.unloadBinaryFileData(path);
                        break;
                    case "TEXT":
                        sharedFileUtils.unloadTextFileData(path);
                        break;
                    case "FONT":
                        this._unregisterFaceFont(resInfo);
                        break;
                    default:
                        throw "cocos2d:unknown filename extension: " + type;
                        break;
                }
            }
        }
    },

    update: function () {
        if (this._isAsync) {
            var frameRate = cc.Director.getInstance()._frameRate;
            if (frameRate != null && frameRate < 20) {
                cc.log("cocos2d: frame rate less than 20 fps, skip frame.");
                return;
            }
        }

        var curData = this._curData;
        if (curData && curData.curNumber < curData.totalNumber) {
            this._loadRes();
            curData.curNumber++;
        }

        var percent = this.getPercentage();
        if(percent >= 100){
            this._complete();
            if (this._resQueue.length > 0) {
                this._running = true;
                this._curData = this._resQueue.shift();
            }
            else{
                this._running = false;
                this._scheduler.unscheduleUpdateForTarget(this);
            }
        }
    },

    _loadRes: function () {
        var sharedTextureCache = cc.TextureCache.getInstance(),
            sharedEngine = cc.AudioEngine ? cc.AudioEngine.getInstance() : null,
            sharedParser = cc.SAXParser.getInstance(),
            sharedFileUtils = cc.FileUtils.getInstance();

        var resInfo = this._curData.resList.shift(),
            path = this._getResPath(resInfo),
            type = this._getResType(resInfo, path);

        switch (type) {
            case "IMAGE":
                sharedTextureCache.addImageAsync(path, this.onResLoaded, this);
                break;
            case "SOUND":
                if (!sharedEngine) throw "Can not find AudioEngine! Install it, please.";
                sharedEngine.preloadSound(path, this.onResLoaded, this);
                break;
            case "XML":
                sharedParser.preloadPlist(path, this.onResLoaded, this);
                break;
            case "BINARY":
                sharedFileUtils.preloadBinaryFileData(path, this.onResLoaded, this);
                break;
            case "TEXT" :
                sharedFileUtils.preloadTextFileData(path, this.onResLoaded, this);
                break;
            case "FONT":
                this._registerFaceFont(resInfo, this.onResLoaded, this);
                break;
            default:
                throw "cocos2d:unknown filename extension: " + type;
                break;
        }
    },

    _getResPath: function (resInfo) {
        return typeof resInfo == "string" ? resInfo : resInfo.src;
    },

    _getResType: function (resInfo, path) {
        var isFont = resInfo.fontName;
        if (isFont != null) {
            return cc.RESOURCE_TYPE["FONT"];
        }
        else {
            var ext = path.substring(path.lastIndexOf(".") + 1, path.length);
            var index = ext.indexOf("?");
            if (index > 0) ext = ext.substring(0, index);

            for (var resType in cc.RESOURCE_TYPE) {
                if (cc.RESOURCE_TYPE[resType].indexOf(ext) != -1) {
                    return resType;
                }
            }
            return ext;
        }
    },

    _complete: function () {
        cc.doCallback(this._curData.selector,this._curData.target);
    },

    _registerFaceFont: function (fontRes,seletor,target) {
        var srcArr = fontRes.src;
        var fileUtils = cc.FileUtils.getInstance();
        if (srcArr && srcArr.length > 0) {
            var fontStyle = document.createElement("style");
            fontStyle.type = "text/css";
            document.body.appendChild(fontStyle);

            var fontStr = "@font-face { font-family:" + fontRes.fontName + "; src:";
            for (var i = 0; i < srcArr.length; i++) {
                fontStr += "url('" + fileUtils.fullPathForFilename(encodeURI(srcArr[i].src)) + "') format('" + srcArr[i].type + "')";
                fontStr += (i == (srcArr.length - 1)) ? ";" : ",";
            }
            fontStyle.textContent += fontStr + "};";

            //preload
            //<div style="font-family: PressStart;">.</div>
            var preloadDiv = document.createElement("div");
            preloadDiv.style.fontFamily = fontRes.fontName;
            preloadDiv.innerHTML = ".";
            preloadDiv.style.position = "absolute";
            preloadDiv.style.left = "-100px";
            preloadDiv.style.top = "-100px";
            document.body.appendChild(preloadDiv);
        }
        cc.doCallback(seletor,target);
    },

    _unregisterFaceFont: function (fontRes) {
        //todo remove style
    }
});

/**
 * Preload resources in the background
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.Loader}
 * @example
 * //example
 * var g_mainmenu = [
 *    {src:"res/hello.png"},
 *    {src:"res/hello.plist"},
 *
 *    {src:"res/logo.png"},
 *    {src:"res/btn.png"},
 *
 *    {src:"res/boom.mp3"},
 * ]
 *
 * var g_level = [
 *    {src:"res/level01.png"},
 *    {src:"res/level02.png"},
 *    {src:"res/level03.png"}
 * ]
 *
 * //load a list of resources
 * cc.Loader.preload(g_mainmenu, this.startGame, this);
 *
 * //load multi lists of resources
 * cc.Loader.preload([g_mainmenu,g_level], this.startGame, this);
 */
cc.Loader.preload = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    this._instance.initWithResources(resources, selector, target);
    return this._instance;
};

/**
 * Preload resources async
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.Loader}
 */
cc.Loader.preloadAsync = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    this._instance.setAsync(true);
    this._instance.initWithResources(resources, selector, target);
    return this._instance;
};

/**
 * Release the resources from a list
 * @param {Array} resources
 */
cc.Loader.purgeCachedData = function (resources) {
    if (this._instance) {
        this._instance.releaseResources(resources);
    }
};

/**
 * Returns a shared instance of the loader
 * @function
 * @return {cc.Loader}
 */
cc.Loader.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    return this._instance;
};

cc.Loader._instance = null;


/**
 * Used to display the loading screen
 * @class
 * @extends cc.Scene
 */
cc.LoaderScene = cc.Scene.extend(/** @lends cc.LoaderScene# */{
    _logo: null,
    _logoTexture: null,
    _texture2d: null,
    _bgLayer: null,
    _label: null,
    _winSize: null,

    /**
     * Constructor
     */
    ctor: function () {
        cc.Scene.prototype.ctor.call(this);
        this._winSize = cc.Director.getInstance().getWinSize();
    },
    init: function () {
        cc.Scene.prototype.init.call(this);

        //logo
        var logoWidth = 324;
        var logoHeight = 324;
        var centerPos = cc.p(this._winSize.width / 2, this._winSize.height / 2);

        this._logoTexture = new Image();
        var _this = this, handler;
        this._logoTexture.addEventListener("load", handler = function () {
            _this._initStage(centerPos);
            this.removeEventListener('load', handler, false);
        });
        this._logoTexture.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUQAAAFECAMAAABoNLf0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpEN0EyNUFBN0Q1MDdFNDExODY0QUQ1NUE0RTI4NzZERSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4NTdFNDA1RDA3RUYxMUU0QTJDMEUyOEQwQjhDMDRCOSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4NTdFNDA1QzA3RUYxMUU0QTJDMEUyOEQwQjhDMDRCOSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3QTI1QUE3RDUwN0U0MTE4NjRBRDU1QTRFMjg3NkRFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQ3QTI1QUE3RDUwN0U0MTE4NjRBRDU1QTRFMjg3NkRFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+FR5MkgAAAYBQTFRFRbf+y9HYV+j/iNPzBihQCnfK6/X7/v//H9f+ARAoTF5xY9b/kfz+XHGHuOXtR8j+1NrhAAQMPKj+Ck2PVNz/KorS5urtvcfQM5j7xufrr7vIV8j/BzVol6a2NoypWqXd3P7+aKzfp9nrC2a2K09tDEN46u/0iZmqyP3+d7Xi2uz4B470FIHPCFSppbC8s9jvcI+qcIOWp+Lua+L/krLIzuX2MW6O3uLnCq/4fP3/t/z/8fT29vz9Xvz/RJjYcuz/N0ZWhI6ZTtP/AjiPECM2Uo6xIzZMBXLpb6u39vf7lcjTcNPUpuv5LHamp/r+oMzrAxs9MmR2UYOZib/nA1TLSKqxDWOZU8HNuu70vt3yPKrMIVmEIC08GkRcHnPLCaDcVtnlrNPvUoKEvM3hJ4T2eOrqBFzkdpy91vX2SsHkXejum5mcAB90I2NcPuf9ld7wyvL1YsvvGztgQKLiFz9B4vb0Ajq4EhokueDl3d/ecnd/8+fn6//++/v8AHHI////NCKVXAAAAIB0Uk5T/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wA4BUtnAABBTUlEQVR42uydCUPaWNeAiQ2mQaOhCNQICkLYBBSroKKIith0VOJSqgV0HGdqZ+pUhy6or8Bf/869CYhWISwqtt+1WnfJw9nPuTeqYpstwbOb2HJbhyIRvd6r9qoLhYJa7fXq9fpIZMjq3krseoR2e8yqdnkgec/oljWiR9BqLrU+Yt0a9eT/H+LV6tzdsiqjd5PlkPvA8/8QhVF3xFtoankj7lHhl4XoSVj1hRYtvTXh+eUgdiaGvIUWL6810fnLQKQm3frCPS29e5L6+SHOjlq9hXtdXuvo7M8MMT86pC48wFIPjeZ/Uoi79y2D1+Vx9+eD2LmlLzzw0m91/kwQqQdS41vUmvpJIHZueQuPtrwPIY73DtFjVRcedamtnicOcTdSaIMV2X26EPMJfaFNlj6Rf5IQ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";
        this._logoTexture.width = logoWidth;
        this._logoTexture.height = logoHeight;

        // bg
        this._bgLayer = cc.LayerColor.create(cc.c4(255, 255, 255, 255));
        this._bgLayer.setPosition(0, 0);
        this.addChild(this._bgLayer, 0);

        var labelLeft = cc.LabelTTF.create("__", "Arial", 66);
        labelLeft.setColor(cc.c3(0, 113, 200));
        labelLeft.setPosition(cc.pAdd(centerPos, cc.p(-138, -logoHeight / 2 - 70 + 33)));
        this._bgLayer.addChild(labelLeft, 10);

        var labelRight = cc.LabelTTF.create("__", "Arial", 66);
        labelRight.setColor(cc.c3(0, 113, 200));
        labelRight.setPosition(cc.pAdd(centerPos, cc.p(138, -logoHeight / 2 - 70 + 33)));
        this._bgLayer.addChild(labelRight, 10);

        //loading percent
        this._label = cc.LabelTTF.create("0%", "Arial", 66);
        this._label.setColor(cc.c3(0, 113, 200));
        this._label.setPosition(cc.pAdd(centerPos, cc.p(0, -logoHeight / 2 - 70)));
        this._bgLayer.addChild(this._label, 10);
    },

    _initStage: function (centerPos) {
        this._texture2d = new cc.Texture2D();
        this._texture2d.initWithElement(this._logoTexture);
        this._texture2d.handleLoadedTexture();
        this._logo = cc.Sprite.createWithTexture(this._texture2d);
        this._logo.setScale(cc.CONTENT_SCALE_FACTOR());
        this._logo.setPosition(centerPos);
        this._bgLayer.addChild(this._logo, 10);
    },

    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this.schedule(this._startLoading, 0.3);
    },

    onExit: function () {
        cc.Node.prototype.onExit.call(this);
        var tmpStr = "0%";
        this._label.setString(tmpStr);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} selector
     * @param {Object} target
     */
    initWithResources: function (resources, selector, target) {
        this.resources = resources;
        this.selector = selector;
        this.target = target;
    },

    _startLoading: function () {
        this.unschedule(this._startLoading);
        cc.Loader.preload(this.resources, this.selector, this.target);
        this.schedule(this._updatePercent);
    },

    _updatePercent: function () {
        var percent = cc.Loader.getInstance().getPercentage();
        var tmpStr = percent + "%";
        this._label.setString(tmpStr);

        if (percent >= 100)
            this.unschedule(this._updatePercent);
    }
});

/**
 * Preload multi scene resources.
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {cc.LoaderScene}
 * @example
 * //example
 * var g_mainmenu = [
 *    {src:"res/hello.png"},
 *    {src:"res/hello.plist"},
 *
 *    {src:"res/logo.png"},
 *    {src:"res/btn.png"},
 *
 *    {src:"res/boom.mp3"},
 * ]
 *
 * var g_level = [
 *    {src:"res/level01.png"},
 *    {src:"res/level02.png"},
 *    {src:"res/level03.png"}
 * ]
 *
 * //load a list of resources
 * cc.LoaderScene.preload(g_mainmenu, this.startGame, this);
 *
 * //load multi lists of resources
 * cc.LoaderScene.preload([g_mainmenu,g_level], this.startGame, this);
 */
cc.LoaderScene.preload = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new cc.LoaderScene();
        this._instance.init();
    }

    this._instance.initWithResources(resources, selector, target);

    var director = cc.Director.getInstance();
    if (director.getRunningScene()) {
        director.replaceScene(this._instance);
    } else {
        director.runWithScene(this._instance);
    }

    return this._instance;
};
