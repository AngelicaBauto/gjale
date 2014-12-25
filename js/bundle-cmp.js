/*
(c) 2013-2014 GameMix Inc.  All rights reserved.
*/
(function() {
    var requestAnimFrame = window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1e3 / 60)
        }
    }();
    var cancelAnimFrame = window.cancelAnimFrame = function() {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function() {
            window.clearTimeout.apply(window, arguments)
        }
    }();
    navigator.vibrate = function() {
        return navigator.vibrate || navigator.mozVibrate || navigator.webkitVibrate || navigator.oVibrate || navigator.msVibrate || (navigator.notification ? function(l) {
            navigator.notification.vibrate(l)
        } : null) || new Function
    }();
    var console = function() {
        return window.console || {
            log: new Function,
            debug: new Function,
            warn: new Function,
            error: new Function,
            clear: new Function
        }
    }();
    var DOM = {
        get: function(el) {
            r = el == document || el == window || el instanceof HTMLElement ? el : document.getElementById(el);
            if (r == null) {
                console.log(el)
            }
            return r
        },
        attr: function(el, attr, value) {
            if (value) {
                this.get(el).setAttribute(attr, value)
            } else {
                return this.get(el).getAttribute(attr)
            }
        },
        on: function(el, evt, handler) {
            var split = evt.split(" ");
            for (var i in split) {
                this.get(el).addEventListener(split[i], handler, false)
            }
        },
        un: function(el, evt, handler) {
            var split = evt.split(" ");
            for (var i in split) {
                this.get(el).removeEventListener(split[i], handler, false)
            }
        },
        show: function(el) {
            this.get(el).style.display = "block"
        },
        hide: function(el) {
            this.get(el).style.display = "none"
        },
        offset: function(el) {
            el = this.get(el);
            return {
                x: el.clientLeft + window.scrollLeft,
                y: el.clientTop + window.scrollTop
            };
            var pos = {
                x: 0,
                y: 0
            };
            do {
                pos.x += el.offsetLeft || 0;
                pos.y += el.offsetTop || 0
            } while ((el = el.parentNode) !== null);
            return pos
        },
        query: function(query) {
            if (!document.querySelectorAll) return null;
            var q = document.querySelectorAll(query);
            return q
        },
        queryOne: function(query) {
            if (!document.querySelector) return null;
            var q = document.querySelector(query);
            return q
        },
        create: function(type) {
            return document.createElement(type)
        },
        positionRelativeTo: function(element, clientX, clientY) {
            var offset = DOM.offset(element);
            return {
                x: clientX - offset.x,
                y: clientY - offset.y
            }
        },
        fitScreen: function(element, ratio) {
            var clientRatio = window.innerWidth / window.innerHeight;
            var width, height;
            if (clientRatio <= ratio) {
                width = window.innerWidth;
                height = width / ratio
            } else {
                height = window.innerHeight;
                width = height * ratio
            }
            element = DOM.get(element);
            element.style.width = width + "px";
            element.style.height = height + "px";
            return {
                width: width,
                height: height
            }
        },
        saveCanvas: function(element) {
            var src = this.get(element);
            var can = this.create("canvas");
            can.width = src.width;
            can.height = src.height;
            var c = can.getContext("2d");
            c.drawImage(src, 0, 0);
            return can
        },
        fadeIn: function(element, duration, callback) {
            element = this.get(element);
            duration = duration || 1e3;
            this.show(element);
            element.style.opacity = 0;
            Util.interpolate(element.style, {
                opacity: 1
            }, duration, callback)
        },
        fadeOut: function(element, duration, callback) {
            element = this.get(element);
            duration = duration || 1e3;
            this.show(element);
            element.style.opacity = 1;
            Util.interpolate(element.style, {
                opacity: 0
            }, duration, function() {
                DOM.hide(element);
                if (callback) callback()
            })
        },
        notify: function(htmlMessage, duration, container) {
            container = container ? this.get(container) : document.body;
            this.notification = this.notification || function() {
                var block = DOM.create("div");
                container.appendChild(block);
                DOM.applyStyle(block, {
                    zIndex: 999999,
                    position: "absolute",
                    bottom: "10px",
                    width: "100%",
                    textAlign: "center"
                });
                var message = DOM.create("span");
                block.appendChild(message);
                DOM.applyStyle(message, {
                    backgroundColor: "rgba(0,0,0,0.7)",
                    border: "1px solid white",
                    borderRadius: "3px",
                    margin: "auto",
                    color: "white",
                    padding: "2px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    width: "50%",
                    fontSize: "0.7em",
                    boxShadow: "0px 0px 2px black"
                });
                return {
                    block: block,
                    message: message,
                    queue: [],
                    add: function(message, duration) {
                        this.queue.push({
                            message: message,
                            duration: duration
                        });
                        if (this.queue.length == 1) {
                            this.applyOne()
                        }
                    },
                    applyOne: function() {
                        var notif = this.queue[0];
                        this.message.innerHTML = notif.message;
                        DOM.fadeIn(this.block, 500);
                        setTimeout(function() {
                            DOM.fadeOut(DOM.notification.block, 500, function() {
                                DOM.notification.queue.shift();
                                if (DOM.notification.queue.length > 0) {
                                    DOM.notification.applyOne()
                                }
                            })
                        }, notif.duration + 500)
                    }
                }
            }();
            duration = duration || 3e3;
            this.notification.add(htmlMessage, duration)
        },
        applyStyle: function(element, style) {
            element = this.get(element);
            for (var i in style) {
                element.style[i] = style[i]
            }
        },
        populate: function(elements) {
            var res = {};
            for (var i in elements) {
                res[i] = DOM.get(elements[i]);
                if (!res[i]) console.log("Element #" + elements[i] + " not found")
            }
            return res
        }
    };
    var Util = {
        preload: function(images, callbackProgress, callbackEnd, callbackError) {
            var loadOne = function() {
                if (remaining.length == 0) {
                    end(loaded)
                } else {
                    var img = new Image;
                    img.onerror = function() {
                        console.log("Couldn't load " + src);
                        error(src)
                    };
                    img.onload = function() {
                        if (this.complete) {
                            progress(this, 1 - remaining.length / nbImages);
                            setTimeout(loadOne, document.location.search.indexOf("fakelag") >= 0 ? 1e3 : 1)
                        }
                    };
                    var src = remaining.pop();
                    img.src = src;
                    loaded[src] = img
                }
            };
            var remaining = images.slice(0);
            var end = callbackEnd || new Function;
            var progress = callbackProgress || new Function;
            var error = callbackError || new Function;
            var nbImages = remaining.length;
            var loaded = {};
            setTimeout(loadOne, 1)
        },
        rand: function(min, max) {
            return Math.random() * (max - min) + min
        },
        randomPick: function() {
            var i = parseInt(Util.rand(0, arguments.length));
            return arguments[i]
        },
        limit: function(n, min, max) {
            if (n < min) return min;
            else if (n > max) return max;
            else return n
        },
        sign: function(n) {
            if (n > 0) return 1;
            else if (n == 0) return 0;
            else return -1
        },
        cookie: {
            set: function(name, value, ttl) {
                if (ttl == undefined) ttl = 1e3 * 3600 * 24 * 365;
                document.cookie = name + "=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
                var expires = new Date;
                expires.setTime(expires.getTime() + ttl);
                document.cookie = [name + "=" + value + "; ", "expires=" + expires.toGMTString() + "; ", "path=/"].join("")
            },
            get: function(name) {
                var cookie = document.cookie.split("; ");
                for (var i in cookie) {
                    var spl = cookie[i].split("=");
                    if (spl.length == 2 && spl[0] == name) {
                        return spl[1]
                    }
                }
                return undefined
            }
        },
        storage: window.localStorage ? {
            getItem: function(item) {
                try {
                    return window.localStorage.getItem(item)
                } catch (e) {
                    return null
                }
            },
            setItem: function(item, value) {
                try {
                    window.localStorage.setItem(item, value)
                } catch (e) {
                    console.log("Local storage issue: " + e)
                }
            }
        } : {
            getItem: function(item) {
                return Util.cookie.get(item)
            },
            setItem: function(item, value) {
                Util.cookie.set(item, value)
            }
        },
        merge: function(template, object) {
            if (!object) {
                return template
            }
            for (var i in template) {
                if (!(i in object)) {
                    object[i] = template[i]
                } else {
                    if (typeof template[i] == "object" && !(object[i] instanceof Array)) {
                        object[i] = arguments.callee.call(this, template[i], object[i])
                    }
                }
            }
            return object
        },
        copyObject: function(obj) {
            var res = {};
            for (var i in obj) {
                res[i] = obj[i]
            }
            return res
        },
        isTouchScreen: function() {
            var bool = "orientation" in window || "orientation" in window.screen || "mozOrientation" in window.screen || "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch || "ontouchstart" in document.documentElement;
            if (bool) {
                bool = bool && Detect.isMobile()
            }
            return bool || window.location.search.indexOf("touch") >= 0
        },
        distance: function(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
        },
        arrayUnique: function(a) {
            for (var i = 0; i < a.length; i++) {
                var j = i + 1;
                while (a[j]) {
                    if (a[i] == a[j]) {
                        a.splice(j, 1)
                    } else {
                        j++
                    }
                }
            }
        },
        analyzeParameters: function() {
            var res = {};
            var tmp;
            var params = window.location.search.substr(1).split("&");
            for (var i = 0; i < params.length; i++) {
                tmp = params[i].split("=");
                res[tmp[0]] = tmp[1]
            }
            return res
        },
        interpolate: function(obj, props, duration, callback) {
            var before = {};
            for (var i in props) {
                before[i] = parseFloat(obj[i])
            }
            var tStart = Date.now();
            (function() {
                var now = Date.now();
                var prct = Math.min(1, (now - tStart) / duration);
                for (var i in props) {
                    obj[i] = prct * (props[i] - before[i]) + before[i]
                }
                if (prct < 1) {
                    requestAnimFrame(arguments.callee)
                } else {
                    if (callback) {
                        callback.call(obj)
                    }
                }
            })()
        },
        addZeros: function(n, length) {
            var res = n.toString();
            while (res.length < length) res = "0" + res;
            return res
        },
        formatDate: function(format, date, options) {
            date = date || new Date;
            options = Util.merge({
                months: ["January", "February", "March", "April", "May", "June", "August", "September", "October", "November", "December"]
            }, options);
            var res = "";
            var formatNext = false;
            for (var i = 0; i < format.length; i++) {
                if (format.charAt(i) == "%") {
                    formatNext = true
                } else if (formatNext) {
                    formatNext = false;
                    switch (format.charAt(i)) {
                        case "%":
                            res += "%";
                            break;
                        case "M":
                            res += options.months[date.getMonth()];
                            break;
                        case "d":
                            res += date.getDate();
                            break;
                        case "Y":
                            res += date.getFullYear();
                            break;
                        case "m":
                            res += date.getMonth();
                            break
                    }
                } else {
                    res += format.charAt(i)
                }
            }
            return res
        },
        keyOf: function(object, element) {
            for (var i in object) {
                if (object[i] == element) {
                    return i
                }
            }
            return null
        }
    };
    var Ajax = {
        send: function(url, method, params, success, fail) {
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest
            } else if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP")
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP")
                }
            } else {
                console.log("AJAX not supported by your browser.");
                return false
            }
            success = success || new Function;
            fail = fail || new Function;
            method = method.toUpperCase();
            params = params || {};
            var paramsArray = [];
            for (var i in params) {
                paramsArray.push(i + "=" + params[i])
            }
            var paramsString = paramsArray.join("&");
            if (method == "GET") {
                url += "?" + paramsString
            }
            xhr.open(method, url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                if (xhr.status < 200 || xhr.status >= 300) {
                    fail(xhr.status, xhr.responseText)
                } else {
                    success(xhr.status, xhr.responseText)
                }
            };
            if (method == "POST") {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(paramsString)
            } else {
                xhr.send(null)
            }
        }
    };
    var ArrayManager = {
        elements: [],
        arrays: [],
        remove: function(array, element) {
            this.arrays.push(array);
            this.elements.push(element)
        },
        flush: function() {
            var ind;
            for (var i in this.arrays) {
                ind = this.arrays[i].indexOf(this.elements[i]);
                if (ind >= 0) {
                    this.arrays[i].splice(ind, 1)
                }
            }
            this.arrays = [];
            this.elements = []
        },
        init: function() {
            this.arrays = [];
            this.elements = []
        }
    };
    var Encoder = {
        buildString: function(tab) {
            var s = "",
                content;
            for (var i in tab) {
                content = tab[i].toString();
                content = content.replace(/=/g, " ");
                content = content.replace(/\|/g, " ");
                s += i + "=" + content + "|"
            }
            return s
        },
        encode: function(hash) {
            var str = Encoder.buildString(hash);
            var key = ~~Util.rand(1, 255);
            var encodedString = Encoder.encodeString(str, key);
            return encodeURIComponent(encodedString)
        },
        encodeString: function(s, cle) {
            var enc = "",
                c;
            for (var i = 0; i < s.length; i++) {
                c = s.charCodeAt(i);
                enc += String.fromCharCode((c + cle) % 256)
            }
            enc = String.fromCharCode(cle) + enc;
            return enc
        }
    };
    var Detect = {
        agent: navigator.userAgent.toLowerCase(),
        isMobile: function() {
            return this.isAndroid() || this.isFirefoxOS() || this.isWindowsMobile() || this.isIOS()
        },
        isAndroid: function() {
            return this.agent.indexOf("android") >= 0
        },
        isFirefoxOS: function() {
            return !this.isAndroid() && this.agent.indexOf("firefox") >= 0 && this.agent.indexOf("mobile") >= 0
        },
        isIOS: function() {
            return this.agent.indexOf("ios") >= 0 || this.agent.indexOf("ipod") >= 0 || this.agent.indexOf("ipad") >= 0 || this.agent.indexOf("iphone") >= 0
        },
        isWindowsMobile: function() {
            return this.agent.indexOf("windows") >= 0 && this.agent.indexOf("mobile") >= 0 || this.agent.indexOf("iemobile") >= 0
        },
        isTizen: function() {
            return this.agent.indexOf("tizen") >= 0
        }
    };
    var resourceManager = {
        processImages: function(images) {
            var canvas = DOM.create("canvas");
            var c = canvas.getContext("2d");
            resources.folder = resources.folder || "";
            R.image = R.image || {};
            if (resources.image) {
                for (var i in resources.image) {
                    R.image[i] = images[resources.folder + resources.image[i]]
                }
            }
            R.pattern = R.pattern || {};
            if (resources.pattern) {
                for (var i in resources.pattern) {
                    R.pattern[i] = c.createPattern(images[resources.folder + resources.pattern[i]], "repeat")
                }
            }
            R.sprite = R.sprite || {};
            if (resources.sprite) {
                for (var i in resources.sprite) {
                    R.sprite[i] = this.createSprite(images[resources.folder + resources.sprite[i].sheet], resources.sprite[i]);
                    if (resources.sprite[i].pattern) {
                        R.pattern[i] = c.createPattern(R.sprite[i], "repeat")
                    }
                }
            }
            R.animation = R.animation || {};
            if (resources.animation) {
                for (var i in resources.animation) {
                    R.animation[i] = [];
                    for (var j = 0; j < resources.animation[i].length; j++) {
                        if (R.sprite[resources.animation[i][j]]) {
                            R.animation[i].push(R.sprite[resources.animation[i][j]])
                        } else {
                            console.log("Error for animation " + i + ': sprite "' + resources.animation[i][j] + '" not found')
                        }
                    }
                }
            }
            R.raw = R.raw || {};
            if (resources.raw) {
                for (var i in resources.raw) {
                    R.raw[i] = resources.raw[i] instanceof Function ? resources.raw[i]() : resources.raw[i]
                }
            }
            R.string = R.string || {};
            if (resources.string) {
                var lang = this.getLanguage(resources.string);
                if (!resources.string[lang]) {
                    var pp = function(obj) {
                        if (typeof obj == "string") {
                            return
                        } else {
                            var o = {};
                            for (var i in obj) {
                                if (typeof obj[i] == "string") {
                                    o[i] = "{" + i + "}"
                                } else {
                                    o[i] = pp(obj[i])
                                }
                            }
                            return o
                        }
                    };
                    resources.string[lang] = pp(resources.string.en)
                }
                for (var i in resources.string[lang]) {
                    R.string[i] = resources.string[lang][i]
                }
                for (var i in R.string) {
                    if (i.charAt(0) == "$") {
                        try {
                            DOM.get(i.substring(1)).innerHTML = R.string[i]
                        } catch (e) {
                            console.log("DOM element " + i + " does not exist")
                        }
                    }
                }
            }
            resources = null;
            resourceManager = null
        },
        createSprite: function(image, details) {
            var canvas = DOM.create("canvas");
            var c = canvas.getContext("2d");
            canvas.width = details.width;
            canvas.height = details.height;
            c.drawImage(image, details.x, details.y, details.width, details.height, 0, 0, details.width, details.height);
            return canvas
        },
        getNecessaryImages: function() {
            var res = [];
            for (var i in resources.image) {
                res.push(resources.folder + resources.image[i])
            }
            for (var i in resources.pattern) {
                res.push(resources.folder + resources.pattern[i])
            }
            for (var i in resources.sprite) {
                res.push(resources.folder + resources.sprite[i].sheet)
            }
            Util.arrayUnique(res);
            return res
        },
        getLanguage: function(languages) {
            var lang = null;
            var browser_language = null;
            var params = Util.analyzeParameters();
            if (params.lang) {
                return params.lang
            }
            if (navigator && navigator.userAgent && (browser_language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
                browser_language = browser_language[1]
            }
            if (!browser_language && navigator) {
                if (navigator.language) {
                    browser_language = navigator.language
                } else if (navigator.browserLanguage) {
                    browser_language = navigator.browserLanguage
                } else if (navigator.systemLanguage) {
                    browser_language = navigator.systemLanguage
                } else if (navigator.userLanguage) {
                    browser_language = navigator.userLanguage
                }
                browser_language = browser_language.substr(0, 2)
            }
            for (var i in languages) {
                if (browser_language.indexOf(i) >= 0) {
                    lang = i;
                    break
                } else if (!lang) {
                    lang = i
                }
            }
            return lang
        }
    };
    var cycleManager = {
        init: function(cycle, fpsMin) {
            this.pause = false;
            this.oncycle = cycle;
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange"
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange"
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange"
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange"
            }
            this.focus = true;
            if (!hidden) {
                DOM.on(window, "focus", function() {
                    cycleManager.focus = true
                });
                DOM.on(window, "blur", function() {
                    cycleManager.focus = false
                })
            } else {
                DOM.on(document, visibilityChange, function() {
                    cycleManager.focus = !document[hidden]
                })
            }
            this.lastCycle = Date.now();
            this.fpsMin = fpsMin || 10;
            this.framesUntilNextStat = 0;
            this.lastStat = 0;
            this.fakeLag = document.location.search.indexOf("fakelag") >= 0;
            this.fps = 0;
            this.requestId = null;
            this.init = null;
            this.resume();
            if (window.kik && kik.browser && kik.browser.on) {
                kik.browser.on("background", function() {
                    cycleManager.stop()
                });
                kik.browser.on("foreground", function() {
                    cycleManager.resume()
                })
            }
        },
        stop: function() {
            this.pause = true;
            cancelAnimFrame(this.requestId)
        },
        resume: function() {
            this.pause = false;
            cancelAnimFrame(this.requestId);
            (function() {
                cycleManager.cycle();
                cycleManager.requestId = requestAnimFrame(arguments.callee)
            })()
        },
        cycle: function() {
            var now = Date.now();
            var elapsed = Math.min((now - this.lastCycle) / 1e3, 1 / this.fpsMin);
            this.lastCycle = now;
            if (!this.pause) {
                this.oncycle(elapsed);
                this.framesUntilNextStat--;
                if (this.framesUntilNextStat <= 0) {
                    this.framesUntilNextStat = 60;
                    this.fps = ~~(60 * 1e3 / (Date.now() - this.lastStat + elapsed));
                    this.lastStat = Date.now()
                }
            }
        }
    };
    var resizer = {
        init: function(width, height, element, desktop) {
            this.enabled = Util.isTouchScreen() || desktop;
            this.targetWidth = width;
            this.targetHeight = height;
            this.element = element;
            this.dimensions = {
                width: width,
                height: height
            };
            this.scale = 1;
            if (Util.isTouchScreen() || desktop) {
                DOM.on(window, "resize orientationchange", function() {
                    resizer.resize()
                });
                this.resize();
                this.toResize = null
            }
            this.init = null
        },
        resize: function() {
            if (!this.toResize && this.enabled) {
                this.toResize = setTimeout(function() {
                    if (!resizer.enabled) return;
                    window.scrollTo(0, 1);
                    resizer.toResize = null;
                    resizer.dimensions = DOM.fitScreen(resizer.element, resizer.targetWidth / resizer.targetHeight);
                    resizer.scale = resizer.dimensions.height / resizer.targetHeight
                }, 1e3)
            }
        }
    };
    if (window.cordova) {
        document.addEventListener("deviceready", function() {
            cordova.exec(null, null, "SplashScreen", "hide", []);
            DOM.notify('More HTML5 games available at <a style="color:white" href="' + GameParams.moregamesurl + '">' + GameParams.moregamesurl + "</a>", 3e3)
        }, false)
    }
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)))
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP;
            return fBound
        }
    }
    window.originalOpen = window.open;
    Number.prototype.mod = function(n) {
        return (this % n + n) % n
    };
    window.noop = new Function;

    function extend(subClass, superClass) {
        if (!subClass.extendsClasses || !subClass.extendsClasses[superClass]) {
            for (var i in superClass.prototype) {
                if (!subClass.prototype[i]) {
                    subClass.prototype[i] = superClass.prototype[i]
                }
            }
            subClass.extendsClasses = subClass.extendsClasses || {};
            subClass.extendsClasses[superClass] = true
        }
    }

    function extendPrototype(superClasses, proto) {
        superClasses = superClasses instanceof Array ? superClasses : [superClasses];
        var subProto = {};
        for (var i in superClasses) {
            for (var j in superClasses[i].prototype) {
                subProto[j] = superClasses[i].prototype[j]
            }
        }
        if (proto) {
            for (var i in proto) {
                subProto[i] = proto[i]
            }
        }
        return subProto
    }

    function quickImplementation(object, prototype) {
        for (var i in prototype) {
            object[i] = prototype[i]
        }
        return object
    }

    function ResourceLoader(settings) {
        this.settings = settings;
        this.appCache = window.applicationCache;
        this.finished = false;
        this.message = null
    }
    ResourceLoader.prototype.load = function(end, canvas) {
        this.endCallback = end;
        this.canvasOutput = canvas;
        if (!this.appCache || this.appCache.status === this.appCache.UNCACHED) {
            this.loadResources()
        } else {
            this.loadCache()
        }
    };
    ResourceLoader.prototype.loadCache = function() {
        console.log("cache");
        this.message = "Updating...";
        this.appCache.addEventListener("checking", this.checkingCache.bind(this), false);
        this.appCache.addEventListener("noupdate", this.loadResources.bind(this), false);
        this.appCache.addEventListener("obsolete", this.loadResources.bind(this), false);
        this.appCache.addEventListener("error", this.loadResources.bind(this), false);
        this.appCache.addEventListener("cached", this.loadResources.bind(this), false);
        this.appCache.addEventListener("downloading", this.updatingCache.bind(this), false);
        this.appCache.addEventListener("progress", this.updatingCacheProgress.bind(this), false);
        this.appCache.addEventListener("updateready", this.updatingCacheReady.bind(this), false);
        if (this.appCache.status === this.appCache.IDLE) {
            try {
                this.appCache.update()
            } catch (e) {
                this.loadResources()
            }
        }
    };
    ResourceLoader.prototype.checkingCache = function() {
        if (!this.finished) {
            this.showProgress(this.canvasOutput, 0)
        }
    };
    ResourceLoader.prototype.updatingCache = function(e) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, 0)
        }
    };
    ResourceLoader.prototype.updatingCacheProgress = function(e) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, e.loaded / e.total || 0)
        }
    };
    ResourceLoader.prototype.updatingCacheReady = function(e) {
        if (!this.finished) {
            this.finished = true;
            try {
                this.appCache.swapCache()
            } catch (e) {}
            location.reload()
        }
    };
    ResourceLoader.prototype.loadResources = function() {
        this.message = "Loading assets. Please wait...";
        this.R = {};
        this.processLanguage(this.R);
        var images = this.getNecessaryImages();
        var loader = this;
        Util.preload(images, this.resourcesProgress.bind(this), this.resourcesLoaded.bind(this), this.resourcesError.bind(this))
    };
    ResourceLoader.prototype.resourcesError = function(imageSrc) {
        alert("Could not load " + imageSrc + ".\nUnable to launch.")
    };
    ResourceLoader.prototype.resourcesProgress = function(img, progress) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, progress)
        }
    };
    ResourceLoader.prototype.resourcesLoaded = function(loadedImages) {
        if (!this.finished) {
            this.finished = true;
            this.processImages(loadedImages, this.R);
            this.endCallback(this.R)
        }
    };
    ResourceLoader.prototype.showProgress = function(canvas, progress) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "10px Arial";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.message, canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillRect(0, canvas.height / 2 - 5, canvas.width, 10);
        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height / 2 - 5, progress * canvas.width, 10);
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.fillText(~~(progress * 100) + "%", progress * canvas.width - 2, canvas.height / 2)
    };
    ResourceLoader.prototype.createSprite = function(image, details) {
        var canvas = document.createElement("canvas");
        var c = canvas.getContext("2d");
        canvas.width = details.width;
        canvas.height = details.height;
        c.drawImage(image, details.x, details.y, details.width, details.height, 0, 0, details.width, details.height);
        return canvas
    };
    ResourceLoader.prototype.getNecessaryImages = function() {
        var res = [];
        for (var i in this.settings.image) {
            res.push(this.settings.folder + this.settings.image[i])
        }
        for (var i in this.settings.pattern) {
            res.push(this.settings.folder + this.settings.pattern[i])
        }
        for (var i in this.settings.sprite) {
            res.push(this.settings.folder + this.settings.sprite[i].sheet)
        }
        Util.arrayUnique(res);
        return res
    };
    ResourceLoader.prototype.getLanguage = function(languages) {
        var lang = null;
        var browser_language = null;
        var params = Util.analyzeParameters();
        if (params.lang) {
            return params.lang
        }
        if (navigator && navigator.userAgent && (browser_language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            browser_language = browser_language[1]
        }
        if (!browser_language && navigator) {
            if (navigator.language) {
                browser_language = navigator.language
            } else if (navigator.browserLanguage) {
                browser_language = navigator.browserLanguage
            } else if (navigator.systemLanguage) {
                browser_language = navigator.systemLanguage
            } else if (navigator.userLanguage) {
                browser_language = navigator.userLanguage
            }
            browser_language = browser_language.substr(0, 2)
        }
        for (var i in languages) {
            if (browser_language.indexOf(i) >= 0) {
                lang = i;
                break
            } else if (!lang) {
                lang = i
            }
        }
        return lang
    };
    ResourceLoader.prototype.processImages = function(images, R) {
        var canvas = DOM.create("canvas");
        var c = canvas.getContext("2d");
        this.settings.folder = this.settings.folder || "";
        R.image = R.image || {};
        if (this.settings.image) {
            for (var i in this.settings.image) {
                R.image[i] = images[this.settings.folder + this.settings.image[i]]
            }
        }
        R.pattern = R.pattern || {};
        if (this.settings.pattern) {
            for (var i in this.settings.pattern) {
                R.pattern[i] = c.createPattern(images[this.settings.folder + this.settings.pattern[i]], "repeat");
                R.pattern[i].width = images[this.settings.folder + this.settings.pattern[i]].width;
                R.pattern[i].height = images[this.settings.folder + this.settings.pattern[i]].height
            }
        }
        R.sprite = R.sprite || {};
        if (this.settings.sprite) {
            for (var i in this.settings.sprite) {
                R.sprite[i] = this.createSprite(images[this.settings.folder + this.settings.sprite[i].sheet], this.settings.sprite[i]);
                if (this.settings.sprite[i].pattern) {
                    R.pattern[i] = c.createPattern(R.sprite[i], "repeat");
                    R.pattern[i].width = R.sprite[i].width;
                    R.pattern[i].height = R.sprite[i].height
                }
            }
        }
        R.animation = R.animation || {};
        if (this.settings.animation) {
            for (var i in this.settings.animation) {
                R.animation[i] = [];
                for (var j = 0; j < this.settings.animation[i].length; j++) {
                    if (R.sprite[this.settings.animation[i][j]]) {
                        R.animation[i].push(R.sprite[this.settings.animation[i][j]])
                    } else {
                        console.log("Error for animation " + i + ': sprite "' + this.settings.animation[i][j] + '" not found')
                    }
                }
            }
        }
        R.raw = R.raw || {};
        if (this.settings.raw) {
            for (var i in this.settings.raw) {
                R.raw[i] = this.settings.raw[i] instanceof Function ? this.settings.raw[i]() : this.settings.raw[i]
            }
        }
    };
    ResourceLoader.prototype.processLanguage = function(R) {
        R.string = R.string || {};
        if (this.settings.string) {
            this.language = this.getLanguage(this.settings.string);
            if (!this.settings.string[this.language]) {
                var pp = function(obj) {
                    if (typeof obj == "string") {
                        return
                    } else {
                        var o = {};
                        for (var i in obj) {
                            if (typeof obj[i] == "string") {
                                o[i] = "{" + i + "}"
                            } else {
                                o[i] = pp(obj[i])
                            }
                        }
                        return o
                    }
                };
                this.settings.string[this.language] = pp(this.settings.string.en)
            }
            for (var i in this.settings.string[this.language]) {
                R.string[i] = this.settings.string[this.language][i]
            }
            for (var i in R.string) {
                if (i.charAt(0) == "$") {
                    try {
                        DOM.get(i.substring(1)).innerHTML = R.string[i]
                    } catch (e) {
                        console.log("DOM element " + i + " does not exist")
                    }
                }
            }
        }
    };

    function Resizer(options) {
        this.delay = options.delay || 0;
        this.element = options.element || null;
        this.baseWidth = options.baseWidth;
        this.baseHeight = options.baseHeight;
        this.onResize = options.onResize;
        this.enabled = true;
        this.scale = 1;
        this.resizeTimeout = null
    }
    Resizer.prototype = {
        needsResize: function(maxWidth, maxHeight) {
            clearTimeout(this.resizeTimeout);
            if (this.enabled) {
                this.maxWidth = maxWidth;
                this.maxHeight = maxHeight;
                this.resizeTimeout = setTimeout(this.resize.bind(this), this.delay)
            }
        },
        resize: function() {
            this.resizeTimeout = null;
            var dimensions = this.getFittingDimensions(this.maxWidth, this.maxHeight);
            this.element.style.width = dimensions.width + "px";
            this.element.style.height = dimensions.height + "px";
            if (this.onResize) {
                this.onResize.call(this)
            }
        },
        scaleX: function() {
            var rect = this.element.getBoundingClientRect();
            return rect.width / this.baseWidth || 1
        },
        scaleY: function() {
            var rect = this.element.getBoundingClientRect();
            return rect.height / this.baseHeight || 1
        },
        getFittingDimensions: function(maxWidth, maxHeight) {
            var availableRatio = maxWidth / maxHeight;
            var baseRatio = this.baseWidth / this.baseHeight;
            var ratioDifference = Math.abs(availableRatio - baseRatio);
            var width, height;
            if (ratioDifference <= .17) {
                width = maxWidth;
                height = maxHeight
            } else if (availableRatio <= baseRatio) {
                width = maxWidth;
                height = width / baseRatio
            } else {
                height = maxHeight;
                width = height * baseRatio
            }
            return {
                width: width,
                height: height
            }
        }
    };
    window.googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];
    (function() {
        var gads = document.createElement("script");
        gads.async = true;
        gads.type = "text/javascript";
        var useSSL = "https:" == document.location.protocol;
        gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
//        var node = document.getElementsByTagName("script")[0];
//        node.parentNode.insertBefore(gads, node)
    })();
    Math.linearTween = function(t, b, c, d) {
        return c * t / d + b
    };
    Math.easeInQuad = function(t, b, c, d) {
        return c * (t /= d) * t + b
    };
    Math.easeOutQuad = function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b
    };
    Math.easeInOutQuad = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * (--t * (t - 2) - 1) + b
    };
    Math.easeInCubic = function(t, b, c, d) {
        return c * (t /= d) * t * t + b
    };
    Math.easeOutCubic = function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b
    };
    Math.easeInOutCubic = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b
    };
    Math.easeInQuart = function(t, b, c, d) {
        return c * (t /= d) * t * t * t + b
    };
    Math.easeOutQuart = function(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
    };
    Math.easeInOutQuart = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b
    };
    Math.easeInQuint = function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b
    };
    Math.easeOutQuint = function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b
    };
    Math.easeInOutQuint = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
    };
    Math.easeInSine = function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
    };
    Math.easeOutSine = function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b
    };
    Math.easeInOutSine = function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
    };
    Math.easeInExpo = function(t, b, c, d) {
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b
    };
    Math.easeOutExpo = function(t, b, c, d) {
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b
    };
    Math.easeInOutExpo = function(t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b
    };
    Math.easeInCirc = function(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
    };
    Math.easeOutCirc = function(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
    };
    Math.easeInOutCirc = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
    };
    Math.easeInElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b
    };
    Math.easeOutElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b
    };
    Math.easeInOutElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * .3 * 1.5;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b
    };
    Math.easeInBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b
    };
    Math.easeOutBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    };
    Math.easeInOutBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
    };
    Math.easeInBounce = function(t, b, c, d) {
        return c - Math.easeOutBounce(d - t, 0, c, d) + b
    };
    Math.easeOutBounce = function(t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * 7.5625 * t * t + b
        } else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b
        } else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b
        } else {
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b
        }
    };
    Math.easeInOutBounce = function(t, b, c, d) {
        if (t < d / 2) return Math.easeInBounce(t * 2, 0, c, d) * .5 + b;
        return Math.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b
    };
    var addToHome = function(w) {
        var nav = w.navigator,
            isIDevice = "platform" in nav && /iphone|ipod|ipad/gi.test(nav.platform),
            isIPad, isRetina, isSafari, isStandalone, OSVersion, startX = 0,
            startY = 0,
            lastVisit = 0,
            isExpired, isSessionActive, isReturningVisitor, balloon, overrideChecks, positionInterval, closeTimeout, options = {
                autostart: true,
                returningVisitor: false,
                animationIn: "drop",
                animationOut: "fade",
                startDelay: 2e3,
                lifespan: 15e3,
                bottomOffset: 14,
                expire: 0,
                message: "",
                touchIcon: false,
                arrow: true,
                hookOnLoad: true,
                closeButton: true,
                iterations: 100
            },
            intl = {
                ar: '<span dir="rtl">قم بتثبيت هذا التطبيق على <span dir="ltr">%device:</span>انقر<span dir="ltr">%icon</span> ،<strong>ثم اضفه الى الشاشة الرئيسية.</strong></span>',
                ca_es: "Per instal·lar aquesta aplicació al vostre %device premeu %icon i llavors <strong>Afegir a pantalla d'inici</strong>.",
                cs_cz: "Pro instalaci aplikace na Váš %device, stiskněte %icon a v nabídce <strong>Přidat na plochu</strong>.",
                da_dk: "Tilføj denne side til din %device: tryk på %icon og derefter <strong>Føj til hjemmeskærm</strong>.",
                de_de: "Installieren Sie diese App auf Ihrem %device: %icon antippen und dann <strong>Zum Home-Bildschirm</strong>.",
                el_gr: "Εγκαταστήσετε αυτήν την Εφαρμογή στήν συσκευή σας %device: %icon μετά πατάτε <strong>Προσθήκη σε Αφετηρία</strong>.",
                en_us: "Install this web app on your %device: tap %icon and then <strong>Add to Home Screen</strong>.",
                es_es: "Para instalar esta app en su %device, pulse %icon y seleccione <strong>Añadir a pantalla de inicio</strong>.",
                fi_fi: "Asenna tämä web-sovellus laitteeseesi %device: paina %icon ja sen jälkeen valitse <strong>Lisää Koti-valikkoon</strong>.",
                fr_fr: "Ajoutez cette application sur votre %device en cliquant sur %icon, puis <strong>Ajouter à l'écran d'accueil</strong>.",
                he_il: '<span dir="rtl">התקן אפליקציה זו על ה-%device שלך: הקש %icon ואז <strong>הוסף למסך הבית</strong>.</span>',
                hr_hr: "Instaliraj ovu aplikaciju na svoj %device: klikni na %icon i odaberi <strong>Dodaj u početni zaslon</strong>.",
                hu_hu: "Telepítse ezt a web-alkalmazást az Ön %device-jára: nyomjon a %icon-ra majd a <strong>Főképernyőhöz adás</strong> gombra.",
                it_it: "Installa questa applicazione sul tuo %device: premi su %icon e poi <strong>Aggiungi a Home</strong>.",
                ja_jp: "このウェブアプリをあなたの%deviceにインストールするには%iconをタップして<strong>ホーム画面に追加</strong>を選んでください。",
                ko_kr: '%device에 웹앱을 설치하려면 %icon을 터치 후 "홈화면에 추가"를 선택하세요',
                nb_no: "Installer denne appen på din %device: trykk på %icon og deretter <strong>Legg til på Hjem-skjerm</strong>",
                nl_nl: "Installeer deze webapp op uw %device: tik %icon en dan <strong>Voeg toe aan beginscherm</strong>.",
                pl_pl: "Aby zainstalować tę aplikacje na %device: naciśnij %icon a następnie <strong>Dodaj jako ikonę</strong>.",
                pt_br: "Instale este aplicativo em seu %device: aperte %icon e selecione <strong>Adicionar à Tela Inicio</strong>.",
                pt_pt: "Para instalar esta aplicação no seu %device, prima o %icon e depois em <strong>Adicionar ao ecrã principal</strong>.",
                ru_ru: "Установите это веб-приложение на ваш %device: нажмите %icon, затем <strong>Добавить в «Домой»</strong>.",
                sv_se: "Lägg till denna webbapplikation på din %device: tryck på %icon och därefter <strong>Lägg till på hemskärmen</strong>.",
                th_th: "ติดตั้งเว็บแอพฯ นี้บน %device ของคุณ: แตะ %icon และ <strong>เพิ่มที่หน้าจอโฮม</strong>",
                tr_tr: "Bu uygulamayı %device'a eklemek için %icon simgesine sonrasında <strong>Ana Ekrana Ekle</strong> düğmesine basın.",
                uk_ua: "Встановіть цей веб сайт на Ваш %device: натисніть %icon, а потім <strong>На початковий екран</strong>.",
                zh_cn: "您可以将此应用安装到您的 %device 上。请按 %icon 然后选择<strong>添加至主屏幕</strong>。",
                zh_tw: "您可以將此應用程式安裝到您的 %device 上。請按 %icon 然後點選<strong>加入主畫面螢幕</strong>。"
            };

        function init() {
            if (!isIDevice) return;
            var now = Date.now(),
                i;
            if (w.addToHomeConfig) {
                for (i in w.addToHomeConfig) {
                    options[i] = w.addToHomeConfig[i]
                }
            }
            if (!options.autostart) options.hookOnLoad = false;
            isIPad = /ipad/gi.test(nav.platform);
            isRetina = w.devicePixelRatio && w.devicePixelRatio > 1;
            isSafari = /Safari/i.test(nav.appVersion) && !/CriOS/i.test(nav.appVersion);
            isStandalone = nav.standalone;
            OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
            OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace("_", ".") : 0;
            lastVisit = +w.localStorage.getItem("addToHome");
            isSessionActive = w.sessionStorage.getItem("addToHomeSession");
            isReturningVisitor = options.returningVisitor ? lastVisit && lastVisit + 28 * 24 * 60 * 60 * 1e3 > now : true;
            if (!lastVisit) lastVisit = now;
            isExpired = isReturningVisitor && lastVisit <= now;
            if (options.hookOnLoad) w.addEventListener("load", loaded, false);
            else if (!options.hookOnLoad && options.autostart) loaded()
        }

        function loaded() {
            w.removeEventListener("load", loaded, false);
            if (!isReturningVisitor) w.localStorage.setItem("addToHome", Date.now());
            else if (options.expire && isExpired) w.localStorage.setItem("addToHome", Date.now() + options.expire * 6e4);
            if (!overrideChecks && (!isSafari || !isExpired || isSessionActive || isStandalone || !isReturningVisitor)) return;
            var touchIcon = "",
                platform = nav.platform.split(" ")[0],
                language = nav.language.replace("-", "_");
            balloon = document.createElement("div");
            balloon.id = "addToHomeScreen";
            balloon.style.cssText += "left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:" + (OSVersion < 5 ? "absolute" : "fixed");
            if (options.message in intl) {
                language = options.message;
                options.message = ""
            }
            if (options.message === "") {
                options.message = language in intl ? intl[language] : intl["en_us"]
            }
            if (options.touchIcon) {
                touchIcon = isRetina ? document.querySelector('head link[rel^=apple-touch-icon][sizes="114x114"],head link[rel^=apple-touch-icon][sizes="144x144"],head link[rel^=apple-touch-icon]') : document.querySelector('head link[rel^=apple-touch-icon][sizes="57x57"],head link[rel^=apple-touch-icon]');
                if (touchIcon) {
                    touchIcon = '<span style="background-image:url(' + touchIcon.href + ')" class="addToHomeTouchIcon"></span>'
                }
            }
            balloon.className = (OSVersion >= 7 ? "addToHomeIOS7 " : "") + (isIPad ? "addToHomeIpad" : "addToHomeIphone") + (touchIcon ? " addToHomeWide" : "");
            balloon.innerHTML = touchIcon + options.message.replace("%device", platform).replace("%icon", OSVersion >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>') + (options.arrow ? '<span class="addToHomeArrow"' + (OSVersion >= 7 && isIPad && touchIcon ? ' style="margin-left:-32px"' : "") + "></span>" : "") + (options.closeButton ? '<span class="addToHomeClose">×</span>' : "");
            document.body.appendChild(balloon);
            if (options.closeButton) balloon.addEventListener("click", clicked, false);
            if (!isIPad && OSVersion >= 6) window.addEventListener("orientationchange", orientationCheck, false);
            setTimeout(show, options.startDelay)
        }

        function show() {
            var duration, iPadXShift = 208;
            if (isIPad) {
                if (OSVersion < 5) {
                    startY = w.scrollY;
                    startX = w.scrollX
                } else if (OSVersion < 6) {
                    iPadXShift = 160
                } else if (OSVersion >= 7) {
                    iPadXShift = 143
                }
                balloon.style.top = startY + options.bottomOffset + "px";
                balloon.style.left = Math.max(startX + iPadXShift - Math.round(balloon.offsetWidth / 2), 9) + "px";
                switch (options.animationIn) {
                    case "drop":
                        duration = "0.6s";
                        balloon.style.webkitTransform = "translate3d(0," + -(w.scrollY + options.bottomOffset + balloon.offsetHeight) + "px,0)";
                        break;
                    case "bubble":
                        duration = "0.6s";
                        balloon.style.opacity = "0";
                        balloon.style.webkitTransform = "translate3d(0," + (startY + 50) + "px,0)";
                        break;
                    default:
                        duration = "1s";
                        balloon.style.opacity = "0"
                }
            } else {
                startY = w.innerHeight + w.scrollY;
                if (OSVersion < 5) {
                    startX = Math.round((w.innerWidth - balloon.offsetWidth) / 2) + w.scrollX;
                    balloon.style.left = startX + "px";
                    balloon.style.top = startY - balloon.offsetHeight - options.bottomOffset + "px"
                } else {
                    balloon.style.left = "50%";
                    balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - (w.orientation % 180 && OSVersion >= 6 && OSVersion < 7 ? 40 : 0) + "px";
                    balloon.style.bottom = options.bottomOffset + "px"
                }
                switch (options.animationIn) {
                    case "drop":
                        duration = "1s";
                        balloon.style.webkitTransform = "translate3d(0," + -(startY + options.bottomOffset) + "px,0)";
                        break;
                    case "bubble":
                        duration = "0.6s";
                        balloon.style.webkitTransform = "translate3d(0," + (balloon.offsetHeight + options.bottomOffset + 50) + "px,0)";
                        break;
                    default:
                        duration = "1s";
                        balloon.style.opacity = "0"
                }
            }
            balloon.offsetHeight;
            balloon.style.webkitTransitionDuration = duration;
            balloon.style.opacity = "1";
            balloon.style.webkitTransform = "translate3d(0,0,0)";
            balloon.addEventListener("webkitTransitionEnd", transitionEnd, false);
            closeTimeout = setTimeout(close, options.lifespan)
        }

        function manualShow(override) {
            if (!isIDevice || balloon) return;
            overrideChecks = override;
            loaded()
        }

        function close() {
            clearInterval(positionInterval);
            clearTimeout(closeTimeout);
            closeTimeout = null;
            if (!balloon) return;
            var posY = 0,
                posX = 0,
                opacity = "1",
                duration = "0";
            if (options.closeButton) balloon.removeEventListener("click", clicked, false);
            if (!isIPad && OSVersion >= 6) window.removeEventListener("orientationchange", orientationCheck, false);
            if (OSVersion < 5) {
                posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY;
                posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX
            }
            balloon.style.webkitTransitionProperty = "-webkit-transform,opacity";
            switch (options.animationOut) {
                case "drop":
                    if (isIPad) {
                        duration = "0.4s";
                        opacity = "0";
                        posY += 50
                    } else {
                        duration = "0.6s";
                        posY += balloon.offsetHeight + options.bottomOffset + 50
                    }
                    break;
                case "bubble":
                    if (isIPad) {
                        duration = "0.8s";
                        posY -= balloon.offsetHeight + options.bottomOffset + 50
                    } else {
                        duration = "0.4s";
                        opacity = "0";
                        posY -= 50
                    }
                    break;
                default:
                    duration = "0.8s";
                    opacity = "0"
            }
            balloon.addEventListener("webkitTransitionEnd", transitionEnd, false);
            balloon.style.opacity = opacity;
            balloon.style.webkitTransitionDuration = duration;
            balloon.style.webkitTransform = "translate3d(" + posX + "px," + posY + "px,0)"
        }

        function clicked() {
            w.sessionStorage.setItem("addToHomeSession", "1");
            isSessionActive = true;
            close()
        }

        function transitionEnd() {
            balloon.removeEventListener("webkitTransitionEnd", transitionEnd, false);
            balloon.style.webkitTransitionProperty = "-webkit-transform";
            balloon.style.webkitTransitionDuration = "0.2s";
            if (!closeTimeout) {
                balloon.parentNode.removeChild(balloon);
                balloon = null;
                return
            }
            if (OSVersion < 5 && closeTimeout) positionInterval = setInterval(setPosition, options.iterations)
        }

        function setPosition() {
            var matrix = new WebKitCSSMatrix(w.getComputedStyle(balloon, null).webkitTransform),
                posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY,
                posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX;
            if (posY == matrix.m42 && posX == matrix.m41) return;
            balloon.style.webkitTransform = "translate3d(" + posX + "px," + posY + "px,0)"
        }

        function reset() {
            w.localStorage.removeItem("addToHome");
            w.sessionStorage.removeItem("addToHomeSession")
        }

        function orientationCheck() {
            balloon.style.marginLeft = -Math.round(balloon.offsetWidth / 2) - (w.orientation % 180 && OSVersion >= 6 && OSVersion < 7 ? 40 : 0) + "px"
        }
        init();
        return {
            show: manualShow,
            close: close,
            reset: reset
        }
    }(window);
    (function(g, m, a, p, i) {
        g["GameMixAPIName"] = i;
        g[i] = g[i] || function(f) {
            g[i].q = g[i].q || [];
            g[i].q.push(f)
        };
        g[i]({
            apiDomain: p
        });
        var s = m.createElement(a),
            d = m.getElementsByTagName(a)[0];
        s.type = "text/javascript";
        s.async = true;
        s.src = "js/gm.js";
        d.parentNode.insertBefore(s, d)
    })(window, document, "script", "http://gmapi.gamemix.com", "gmapi");
    gmapi("astroalpaca");
    (function() {
        var cache = {};
        var ctx = null,
            usingWebAudio = true,
            noAudio = false;
        try {
            if (typeof AudioContext !== "undefined") {
                ctx = new AudioContext
            } else if (typeof webkitAudioContext !== "undefined") {
                ctx = new webkitAudioContext
            } else {
                usingWebAudio = false
            }
        } catch (e) {
            usingWebAudio = false
        }
        if (!usingWebAudio) {
            if (typeof Audio !== "undefined") {
                try {
                    new Audio
                } catch (e) {
                    noAudio = true
                }
            } else {
                noAudio = true
            }
        }
        if (usingWebAudio) {
            var masterGain = typeof ctx.createGain === "undefined" ? ctx.createGainNode() : ctx.createGain();
            masterGain.gain.value = 1;
            masterGain.connect(ctx.destination)
        }
        var HowlerGlobal = function() {
            this._volume = 1;
            this._muted = false;
            this.usingWebAudio = usingWebAudio;
            this.noAudio = noAudio;
            this._howls = []
        };
        HowlerGlobal.prototype = {
            volume: function(vol) {
                var self = this;
                vol = parseFloat(vol);
                if (vol >= 0 && vol <= 1) {
                    self._volume = vol;
                    if (usingWebAudio) {
                        masterGain.gain.value = vol
                    }
                    for (var key in self._howls) {
                        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                            for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                                self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume
                            }
                        }
                    }
                    return self
                }
                return usingWebAudio ? masterGain.gain.value : self._volume
            },
            mute: function() {
                this._setMuted(true);
                return this
            },
            unmute: function() {
                this._setMuted(false);
                return this
            },
            _setMuted: function(muted) {
                var self = this;
                self._muted = muted;
                if (usingWebAudio) {
                    masterGain.gain.value = muted ? 0 : self._volume
                }
                for (var key in self._howls) {
                    if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                        for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                            self._howls[key]._audioNode[i].muted = muted
                        }
                    }
                }
            }
        };
        var Howler = new HowlerGlobal;
        var audioTest = null;
        if (!noAudio) {
            audioTest = new Audio;
            var codecs = {
                mp3: !!audioTest.canPlayType("audio/mpeg;").replace(/^no$/, ""),
                opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
                ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
                aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
                m4a: !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                mp4: !!(audioTest.canPlayType("audio/x-mp4;") || audioTest.canPlayType("audio/mp4;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
            }
        }
        var Howl = function(o) {
            var self = this;
            self._autoplay = o.autoplay || false;
            self._buffer = o.buffer || false;
            self._duration = o.duration || 0;
            self._format = o.format || null;
            self._loop = o.loop || false;
            self._loaded = false;
            self._sprite = o.sprite || {};
            self._src = o.src || "";
            self._pos3d = o.pos3d || [0, 0, -.5];
            self._volume = o.volume !== undefined ? o.volume : 1;
            self._urls = o.urls || [];
            self._rate = o.rate || 1;
            self._model = o.model || null;
            self._onload = [o.onload || function() {}];
            self._onloaderror = [o.onloaderror || function() {}];
            self._onend = [o.onend || function() {}];
            self._onpause = [o.onpause || function() {}];
            self._onplay = [o.onplay || function() {}];
            self._onendTimer = [];
            self._webAudio = usingWebAudio && !self._buffer;
            self._audioNode = [];
            if (self._webAudio) {
                self._setupAudioNode()
            }
            Howler._howls.push(self);
            self.load()
        };
        Howl.prototype = {
            load: function() {
                var self = this,
                    url = null;
                if (noAudio) {
                    self.on("loaderror");
                    return
                }
                for (var i = 0; i < self._urls.length; i++) {
                    var ext, urlItem;
                    if (self._format) {
                        ext = self._format
                    } else {
                        urlItem = self._urls[i].toLowerCase().split("?")[0];
                        ext = urlItem.match(/.+\.([^?]+)(\?|$)/);
                        ext = ext && ext.length >= 2 ? ext : urlItem.match(/data\:audio\/([^?]+);/);
                        if (ext) {
                            ext = ext[1]
                        } else {
                            self.on("loaderror");
                            return
                        }
                    }
                    if (codecs[ext]) {
                        url = self._urls[i];
                        break
                    }
                }
                if (!url) {
                    self.on("loaderror");
                    return
                }
                self._src = url;
                if (self._webAudio) {
                    loadBuffer(self, url)
                } else {
                    var newNode = new Audio;
                    newNode.addEventListener("error", function() {
                        if (newNode.error && newNode.error.code === 4) {
                            HowlerGlobal.noAudio = true
                        }
                        self.on("loaderror", {
                            type: newNode.error ? newNode.error.code : 0
                        })
                    }, false);
                    self._audioNode.push(newNode);
                    newNode.src = url;
                    newNode._pos = 0;
                    newNode.preload = "auto";
                    newNode.volume = Howler._muted ? 0 : self._volume * Howler.volume();
                    cache[url] = self;
                    var listener = function() {
                        self._duration = Math.ceil(newNode.duration * 10) / 10;
                        if (Object.getOwnPropertyNames(self._sprite).length === 0) {
                            self._sprite = {
                                _default: [0, self._duration * 1e3]
                            }
                        }
                        if (!self._loaded) {
                            self._loaded = true;
                            self.on("load")
                        }
                        if (self._autoplay) {
                            self.play()
                        }
                        newNode.removeEventListener("canplaythrough", listener, false)
                    };
                    newNode.addEventListener("canplaythrough", listener, false);
                    newNode.load()
                }
                return self
            },
            urls: function(urls) {
                var self = this;
                if (urls) {
                    self.stop();
                    self._urls = typeof urls === "string" ? [urls] : urls;
                    self._loaded = false;
                    self.load();
                    return self
                } else {
                    return self._urls
                }
            },
            play: function(sprite, callback) {
                var self = this;
                if (typeof sprite === "function") {
                    callback = sprite
                }
                if (!sprite || typeof sprite === "function") {
                    sprite = "_default"
                }
                if (!self._loaded) {
                    self.on("load", function() {
                        self.play(sprite, callback)
                    });
                    return self
                }
                if (!self._sprite[sprite]) {
                    if (typeof callback === "function") callback();
                    return self
                }
                self._inactiveNode(function(node) {
                    node._sprite = sprite;
                    var pos = node._pos > 0 ? node._pos : self._sprite[sprite][0] / 1e3;
                    var duration = 0;
                    if (self._webAudio) {
                        duration = self._sprite[sprite][1] / 1e3 - node._pos;
                        if (node._pos > 0) {
                            pos = self._sprite[sprite][0] / 1e3 + pos
                        }
                    } else {
                        duration = self._sprite[sprite][1] / 1e3 - (pos - self._sprite[sprite][0] / 1e3)
                    }
                    var loop = !!(self._loop || self._sprite[sprite][2]);
                    var soundId = typeof callback === "string" ? callback : Math.round(Date.now() * Math.random()) + "",
                        timerId;
                    (function() {
                        var data = {
                            id: soundId,
                            sprite: sprite,
                            loop: loop
                        };
                        timerId = setTimeout(function() {
                            if (!self._webAudio && loop) {
                                self.stop(data.id).play(sprite, data.id)
                            }
                            if (self._webAudio && !loop) {
                                self._nodeById(data.id).paused = true;
                                self._nodeById(data.id)._pos = 0
                            }
                            if (!self._webAudio && !loop) {
                                self.stop(data.id)
                            }
                            self.on("end", soundId)
                        }, duration * 1e3);
                        self._onendTimer.push({
                            timer: timerId,
                            id: data.id
                        })
                    })();
                    if (self._webAudio) {
                        var loopStart = self._sprite[sprite][0] / 1e3,
                            loopEnd = self._sprite[sprite][1] / 1e3;
                        node.id = soundId;
                        node.paused = false;
                        refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
                        self._playStart = ctx.currentTime;
                        node.gain.value = self._volume;
                        if (typeof node.bufferSource.start === "undefined") {
                            node.bufferSource.noteGrainOn(0, pos, duration)
                        } else {
                            node.bufferSource.start(0, pos, duration)
                        }
                    } else {
                        if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
                            node.readyState = 4;
                            node.id = soundId;
                            node.currentTime = pos;
                            node.muted = Howler._muted || node.muted;
                            node.volume = self._volume * Howler.volume();
                            setTimeout(function() {
                                node.play()
                            }, 0)
                        } else {
                            self._clearEndTimer(soundId);
                            (function() {
                                var sound = self,
                                    playSprite = sprite,
                                    fn = callback,
                                    newNode = node;
                                var listener = function() {
                                    sound.play(playSprite, fn);
                                    newNode.removeEventListener("canplaythrough", listener, false)
                                };
                                newNode.addEventListener("canplaythrough", listener, false)
                            })();
                            return self
                        }
                    }
                    self.on("play");
                    if (typeof callback === "function") callback(soundId);
                    return self
                });
                return self
            },
            pause: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.pause(id)
                    });
                    return self
                }
                self._clearEndTimer(id);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    activeNode._pos = self.pos(null, id);
                    if (self._webAudio) {
                        if (!activeNode.bufferSource || activeNode.paused) {
                            return self
                        }
                        activeNode.paused = true;
                        if (typeof activeNode.bufferSource.stop === "undefined") {
                            activeNode.bufferSource.noteOff(0)
                        } else {
                            activeNode.bufferSource.stop(0)
                        }
                    } else {
                        activeNode.pause()
                    }
                }
                self.on("pause");
                return self
            },
            stop: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.stop(id)
                    });
                    return self
                }
                self._clearEndTimer(id);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    activeNode._pos = 0;
                    if (self._webAudio) {
                        if (!activeNode.bufferSource || activeNode.paused) {
                            return self
                        }
                        activeNode.paused = true;
                        if (typeof activeNode.bufferSource.stop === "undefined") {
                            activeNode.bufferSource.noteOff(0)
                        } else {
                            activeNode.bufferSource.stop(0)
                        }
                    } else if (!isNaN(activeNode.duration)) {
                        activeNode.pause();
                        activeNode.currentTime = 0
                    }
                }
                return self
            },
            mute: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.mute(id)
                    });
                    return self
                }
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (self._webAudio) {
                        activeNode.gain.value = 0
                    } else {
                        activeNode.muted = true
                    }
                }
                return self
            },
            unmute: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.unmute(id)
                    });
                    return self
                }
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (self._webAudio) {
                        activeNode.gain.value = self._volume
                    } else {
                        activeNode.muted = false
                    }
                }
                return self
            },
            volume: function(vol, id) {
                var self = this;
                vol = parseFloat(vol);
                if (vol >= 0 && vol <= 1) {
                    self._volume = vol;
                    if (!self._loaded) {
                        self.on("play", function() {
                            self.volume(vol, id)
                        });
                        return self
                    }
                    var activeNode = id ? self._nodeById(id) : self._activeNode();
                    if (activeNode) {
                        if (self._webAudio) {
                            activeNode.gain.value = vol
                        } else {
                            activeNode.volume = vol * Howler.volume()
                        }
                    }
                    return self
                } else {
                    return self._volume
                }
            },
            loop: function(loop) {
                var self = this;
                if (typeof loop === "boolean") {
                    self._loop = loop;
                    return self
                } else {
                    return self._loop
                }
            },
            sprite: function(sprite) {
                var self = this;
                if (typeof sprite === "object") {
                    self._sprite = sprite;
                    return self
                } else {
                    return self._sprite
                }
            },
            pos: function(pos, id) {
                var self = this;
                if (!self._loaded) {
                    self.on("load", function() {
                        self.pos(pos)
                    });
                    return typeof pos === "number" ? self : self._pos || 0
                }
                pos = parseFloat(pos);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (pos >= 0) {
                        self.pause(id);
                        activeNode._pos = pos;
                        self.play(activeNode._sprite, id);
                        return self
                    } else {
                        return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime
                    }
                } else if (pos >= 0) {
                    return self
                } else {
                    for (var i = 0; i < self._audioNode.length; i++) {
                        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                            return self._webAudio ? self._audioNode[i]._pos : self._audioNode[i].currentTime
                        }
                    }
                }
            },
            pos3d: function(x, y, z, id) {
                var self = this;
                y = typeof y === "undefined" || !y ? 0 : y;
                z = typeof z === "undefined" || !z ? -.5 : z;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.pos3d(x, y, z, id)
                    });
                    return self
                }
                if (x >= 0 || x < 0) {
                    if (self._webAudio) {
                        var activeNode = id ? self._nodeById(id) : self._activeNode();
                        if (activeNode) {
                            self._pos3d = [x, y, z];
                            activeNode.panner.setPosition(x, y, z);
                            activeNode.panner.panningModel = self._model || "HRTF"
                        }
                    }
                } else {
                    return self._pos3d
                }
                return self
            },
            fade: function(from, to, len, callback, id) {
                var self = this,
                    diff = Math.abs(from - to),
                    dir = from > to ? "down" : "up",
                    steps = diff / .01,
                    stepTime = len / steps;
                if (!self._loaded) {
                    self.on("load", function() {
                        self.fade(from, to, len, callback, id)
                    });
                    return self
                }
                self.volume(from, id);
                for (var i = 1; i <= steps; i++) {
                    (function() {
                        var change = self._volume + (dir === "up" ? .01 : -.01) * i,
                            vol = Math.round(1e3 * change) / 1e3,
                            toVol = to;
                        setTimeout(function() {
                            self.volume(vol, id);
                            if (vol === toVol) {
                                if (callback) callback()
                            }
                        }, stepTime * i)
                    })()
                }
            },
            fadeIn: function(to, len, callback) {
                return this.volume(0).play().fade(0, to, len, callback)
            },
            fadeOut: function(to, len, callback, id) {
                var self = this;
                return self.fade(self._volume, to, len, function() {
                    if (callback) callback();
                    self.pause(id);
                    self.on("end")
                }, id)
            },
            _nodeById: function(id) {
                var self = this,
                    node = self._audioNode[0];
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].id === id) {
                        node = self._audioNode[i];
                        break
                    }
                }
                return node
            },
            _activeNode: function() {
                var self = this,
                    node = null;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (!self._audioNode[i].paused) {
                        node = self._audioNode[i];
                        break
                    }
                }
                self._drainPool();
                return node
            },
            _inactiveNode: function(callback) {
                var self = this,
                    node = null;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                        callback(self._audioNode[i]);
                        node = true;
                        break
                    }
                }
                self._drainPool();
                if (node) {
                    return
                }
                var newNode;
                if (self._webAudio) {
                    newNode = self._setupAudioNode();
                    callback(newNode)
                } else {
                    self.load();
                    newNode = self._audioNode[self._audioNode.length - 1];
                    var listenerEvent = navigator.isCocoonJS ? "canplaythrough" : "loadedmetadata";
                    var listener = function() {
                        newNode.removeEventListener(listenerEvent, listener, false);
                        callback(newNode)
                    };
                    newNode.addEventListener(listenerEvent, listener, false)
                }
            },
            _drainPool: function() {
                var self = this,
                    inactive = 0,
                    i;
                for (i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].paused) {
                        inactive++
                    }
                }
                for (i = self._audioNode.length - 1; i >= 0; i--) {
                    if (inactive <= 5) {
                        break
                    }
                    if (self._audioNode[i].paused) {
                        if (self._webAudio) {
                            self._audioNode[i].disconnect(0)
                        }
                        inactive--;
                        self._audioNode.splice(i, 1)
                    }
                }
            },
            _clearEndTimer: function(soundId) {
                var self = this,
                    index = 0;
                for (var i = 0; i < self._onendTimer.length; i++) {
                    if (self._onendTimer[i].id === soundId) {
                        index = i;
                        break
                    }
                }
                var timer = self._onendTimer[index];
                if (timer) {
                    clearTimeout(timer.timer);
                    self._onendTimer.splice(index, 1)
                }
            },
            _setupAudioNode: function() {
                var self = this,
                    node = self._audioNode,
                    index = self._audioNode.length;
                node[index] = typeof ctx.createGain === "undefined" ? ctx.createGainNode() : ctx.createGain();
                node[index].gain.value = self._volume;
                node[index].paused = true;
                node[index]._pos = 0;
                node[index].readyState = 4;
                node[index].connect(masterGain);
                node[index].panner = ctx.createPanner();
                node[index].panner.panningModel = self._model || "equalpower";
                node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
                node[index].panner.connect(node[index]);
                return node[index]
            },
            on: function(event, fn) {
                var self = this,
                    events = self["_on" + event];
                if (typeof fn === "function") {
                    events.push(fn)
                } else {
                    for (var i = 0; i < events.length; i++) {
                        if (fn) {
                            events[i].call(self, fn)
                        } else {
                            events[i].call(self)
                        }
                    }
                }
                return self
            },
            off: function(event, fn) {
                var self = this,
                    events = self["_on" + event],
                    fnString = fn.toString();
                for (var i = 0; i < events.length; i++) {
                    if (fnString === events[i].toString()) {
                        events.splice(i, 1);
                        break
                    }
                }
                return self
            },
            unload: function() {
                var self = this;
                var nodes = self._audioNode;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (!nodes[i].paused) {
                        self.stop(nodes[i].id)
                    }
                    if (!self._webAudio) {
                        nodes[i].src = ""
                    } else {
                        nodes[i].disconnect(0)
                    }
                }
                for (i = 0; i < self._onendTimer.length; i++) {
                    clearTimeout(self._onendTimer[i].timer)
                }
                var index = Howler._howls.indexOf(self);
                if (index !== null && index >= 0) {
                    Howler._howls.splice(index, 1)
                }
                delete cache[self._src];
                self = null
            }
        };
        if (usingWebAudio) {
            var loadBuffer = function(obj, url) {
                if (url in cache) {
                    obj._duration = cache[url].duration;
                    loadSound(obj)
                } else {
                    var xhr = new XMLHttpRequest;
                    xhr.open("GET", url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function() {
                        ctx.decodeAudioData(xhr.response, function(buffer) {
                            if (buffer) {
                                cache[url] = buffer;
                                loadSound(obj, buffer)
                            }
                        }, function(err) {
                            obj.on("loaderror")
                        })
                    };
                    xhr.onerror = function() {
                        if (obj._webAudio) {
                            obj._buffer = true;
                            obj._webAudio = false;
                            obj._audioNode = [];
                            delete obj._gainNode;
                            obj.load()
                        }
                    };
                    try {
                        xhr.send()
                    } catch (e) {
                        xhr.onerror()
                    }
                }
            };
            var loadSound = function(obj, buffer) {
                obj._duration = buffer ? buffer.duration : obj._duration;
                if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
                    obj._sprite = {
                        _default: [0, obj._duration * 1e3]
                    }
                }
                if (!obj._loaded) {
                    obj._loaded = true;
                    obj.on("load")
                }
                if (obj._autoplay) {
                    obj.play()
                }
            };
            var refreshBuffer = function(obj, loop, id) {
                var node = obj._nodeById(id);
                node.bufferSource = ctx.createBufferSource();
                node.bufferSource.buffer = cache[obj._src];
                node.bufferSource.connect(node.panner);
                node.bufferSource.loop = loop[0];
                if (loop[0]) {
                    node.bufferSource.loopStart = loop[1];
                    node.bufferSource.loopEnd = loop[1] + loop[2]
                }
                node.bufferSource.playbackRate.value = obj._rate
            }
        }
        if (typeof define === "function" && define.amd) {
            define(function() {
                return {
                    Howler: Howler,
                    Howl: Howl
                }
            })
        }
        if (typeof exports !== "undefined") {
            exports.Howler = Howler;
            exports.Howl = Howl
        }
        if (typeof window !== "undefined") {
            window.Howler = Howler;
            window.Howl = Howl
        }
    })();

    function DisplayableObject() {
        this.parent = null;
        this.x = this.y = 0;
        this.rotation = 0;
        this.scaleX = this.scaleY = 1;
        this.alpha = 1;
        this.visible = true
    }
    DisplayableObject.prototype = {
        applyTransforms: function(c) {
            if (this.x != 0 || this.y != 0) c.translate(~~this.x, ~~this.y);
            if (this.scaleX != 1 || this.scaleY != 1) c.scale(this.scaleX, this.scaleY);
            if (this.rotation != 0) c.rotate(this.rotation);
            if (this.alpha != 1) c.globalAlpha *= this.alpha
        },
        doRender: function(c) {
            if (this.visible && this.alpha > .01 && this.scaleX != 0 && this.scaleY != 0) {
                c.save();
                this.applyTransforms(c);
                this.render(c);
                c.restore()
            }
        },
        render: function(c) {
            throw new Error("Rendering undefined")
        },
        remove: function() {
            if (this.parent) {
                this.parent.removeChild(this)
            }
        },
        leaves: function() {
            return 1
        }
    };

    function DisplayableContainer() {
        DisplayableObject.call(this);
        this.children = []
    }
    DisplayableContainer.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            var i = -1;
            while (this.children[++i]) {
                this.children[i].doRender(c)
            }
        },
        addChild: function(child) {
            if (child.parent) {
                child.parent.removeChild(child)
            }
            this.children.push(child);
            child.parent = this;
            child.parentIndex = this.children.length - 1
        },
        removeChild: function(child) {
            if (!isNaN(child.parentIndex)) {
                this.children.splice(child.parentIndex, 1);
                for (var i = child.parentIndex; i < this.children.length; i++) {
                    this.children[i].parentIndex--
                }
                child.parent = null;
                child.parentIndex = null
            }
        },
        clear: function() {
            for (var i in this.children) {
                this.children[i].parent = null;
                this.children[i].parentIndex = null
            }
            this.children = []
        },
        leaves: function() {
            var total = 0;
            for (var i in this.children) {
                total += this.children[i].leaves()
            }
            return total
        }
    });

    function DisplayableImage() {
        DisplayableObject.call(this);
        this.image = null;
        this.anchorX = this.anchorY = 0
    }
    DisplayableImage.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            c.drawImage(this.image, this.anchorX, this.anchorY)
        }
    });

    function DisplayableRectangle() {
        DisplayableContainer.call(this);
        this.color = "#000";
        this.width = 0;
        this.height = 0
    }
    DisplayableRectangle.prototype = extendPrototype(DisplayableContainer, {
        render: function(c) {
            c.fillStyle = this.color;
            c.fillRect(0, 0, this.width, this.height);
            DisplayableContainer.prototype.render.call(this, c)
        }
    });

    function DisplayableShape(drawFunction) {
        DisplayableObject.call(this);
        this.drawFunction = drawFunction
    }
    DisplayableShape.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            this.drawFunction(c)
        }
    });

    function DisplayableTextField() {
        DisplayableObject.call(this);
        this.text = null;
        this.font = "12pt Arial";
        this.textAlign = "left";
        this.textBaseline = "top";
        this.color = "#000";
        this.shadowColor = null;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.outlineColor = null;
        this.outlineWidth = 0
    }
    DisplayableTextField.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            if (this.text != null && this.text.length > 0) {
                c.font = this.font;
                c.textAlign = this.textAlign;
                c.textBaseline = this.textBaseline;
                if (this.shadowColor) {
                    c.fillStyle = this.shadowColor;
                    c.fillText(this.text, this.shadowOffsetX, this.shadowOffsetY)
                }
                c.fillStyle = this.color;
                c.fillText(this.text, 0, 0);
                if (this.outlineColor) {
                    c.strokeStyle = this.outlineColor;
                    c.lineWidth = this.outlineWidth;
                    c.strokeText(this.text, 0, 0)
                }
            }
        }
    });

    function AnimatedView(settings) {
        DisplayableContainer.call(this);
        settings = settings || {};
        this.frames = settings.frames;
        this.frame = new DisplayableImage;
        this.addChild(this.frame);
        this.curFrame = -1;
        this.timeout = null;
        this.animated = false;
        this.applyNextFrame()
    }
    AnimatedView.prototype = extendPrototype(DisplayableContainer, {
        animate: function() {
            if (!this.animated) {
                this.animated = true;
                this.applyNextFrame()
            }
        },
        stop: function() {
            if (this.animated) {
                this.animated = false;
                clearTimeout(this.timeout)
            }
        },
        applyNextFrame: function() {
            this.setFrame(this.curFrame + 1);
            if (this.animated) {
                if (this.currentDelay) {
                    this.currentDelay.cancel()
                }
                this.timeout = setTimeout(this.applyNextFrame.bind(this), this.nextFrame)
            }
        },
        setFrame: function(n) {
            if (!isNaN(n)) {
                this.curFrame = n % this.frames.length
            } else {
                for (var i = 0; i < this.frames.length; i++) {
                    if (this.frames[i].label == n) {
                        this.curFrame = i;
                        break
                    }
                }
            }
            this.frame.image = this.frames[this.curFrame].image;
            this.frame.anchorX = this.frames[this.curFrame].anchorX || 0;
            this.frame.anchorY = this.frames[this.curFrame].anchorY || 0;
            this.nextFrame = this.frames[this.curFrame].duration || 1
        }
    });

    function MultilineTextField() {
        DisplayableTextField.call(this);
        this.maxWidth = 100;
        this.lineHeight = 20
    }
    MultilineTextField.prototype = extendPrototype(DisplayableTextField, {
        render: function(c) {
            c.font = this.font;
            c.textAlign = this.textAlign;
            c.textBaseline = "top";
            if (this.text != this.previouslyComputedText) {
                var lines = this.text.toString().split("\n");
                this.finalLines = [];
                var curLineWidth, words, metrics;
                for (var i = 0; i < lines.length; i++) {
                    words = lines[i].split(" ");
                    for (var j = 0; j < words.length; j++) {
                        metrics = c.measureText(words[j] + " ") || {
                            width: 20,
                            height: 20
                        };
                        if (j == 0 || metrics.width + curLineWidth > this.maxWidth) {
                            this.finalLines.push("");
                            curLineWidth = 0
                        }
                        curLineWidth += metrics.width;
                        this.finalLines[this.finalLines.length - 1] += words[j] + " "
                    }
                }
                this.previouslyComputedText = this.text
            }
            var totalHeight = this.finalLines.length * this.lineHeight;
            var y, step;
            if (this.baseline == "top") {
                y = 0;
                step = this.lineHeight
            } else if (this.baseline == "bottom") {
                y = totalHeight;
                step = -this.lineHeight
            } else {
                y = -totalHeight / 2;
                step = this.lineHeight
            }
            c.strokeStyle = this.outlineColor;
            c.lineWidth = this.outlineWidth;
            for (var i = 0; i < this.finalLines.length; i++, y += step) {
                if (this.shadowColor) {
                    c.fillStyle = this.shadowColor;
                    c.fillText(this.finalLines[i], this.shadowOffsetX, this.shadowOffsetY + y)
                }
                c.fillStyle = this.color;
                c.fillText(this.finalLines[i], 0, y);
                if (this.outlineColor) {
                    c.strokeText(this.finalLines[i], 0, y)
                }
            }
        }
    });

    function CachedContainer() {
        DisplayableContainer.call(this);
        this.width = 0;
        this.height = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.cache = null;
        this.cachingEnabled = true
    }
    CachedContainer.prototype = extendPrototype(DisplayableContainer, {
        render: function(c) {
            if (this.cachingEnabled) {
                c.drawImage(this.getCache(), -this.offsetX, -this.offsetY)
            } else {
                DisplayableContainer.prototype.render.call(this, c)
            }
        },
        renewCache: function() {
            this.cache = null
        },
        addChild: function(child) {
            DisplayableContainer.prototype.addChild.call(this, child);
            this.cache = null
        },
        removeChild: function(child) {
            DisplayableContainer.prototype.removeChild.call(this, child);
            this.cache = null
        },
        getCache: function() {
            if (this.cache == null) {
                this.cache = document.createElement("canvas");
                this.cache.width = this.width;
                this.cache.height = this.height;
                var c = this.cache.getContext("2d");
                c.translate(this.offsetX, this.offsetY);
                DisplayableContainer.prototype.render.call(this, c)
            }
            return this.cache
        }
    });

    function Tween(object, property, from, to, duration, delay, onFinish) {
        this.object = object;
        this.delayLeft = delay || 0;
        this.duration = duration;
        this.elapsed = 0;
        this.property = property;
        this.from = from;
        this.to = to;
        this.onFinish = onFinish;
        this.cancelled = false;
        object[property] = from
    }
    Tween.prototype = {
        cycle: function(e) {
            if (this.delayLeft > 0) {
                this.delayLeft -= e;
                this.object[this.property] = this.from
            }
            if (this.delayLeft <= 0) {
                this.elapsed += e;
                if (this.elapsed >= this.duration) {
                    this.finish()
                } else {
                    this.progress()
                }
            }
        },
        finish: function() {
            this.object[this.property] = this.to;
            if (this.onFinish) {
                this.onFinish.call(this)
            }
        },
        cancel: function() {
            this.cancelled = true
        },
        isFinished: function() {
            return this.elapsed >= this.duration || this.cancelled
        },
        progress: function() {
            var prct = this.duration > 0 ? this.elapsed / this.duration : 1;
            this.object[this.property] = prct * (this.to - this.from) + this.from
        }
    };

    function Interpolation(settings) {
        this.object = settings.object;
        this.property = settings.property;
        this.delay = settings.delay || 0;
        this.duration = settings.duration || 1;
        this.from = settings.from;
        this.to = settings.to;
        this.easing = settings.easing || Math.linearTween;
        this.easingParameter = settings.easingParameter || null;
        this.onFinish = settings.onFinish || noop;
        this.applyFunction = settings.applyFunction || function(easing, duration, from, to, elapsed, easingParam) {
            return easing(elapsed, from, to - from, duration, easingParam)
        };
        this.delayLeft = this.delay;
        this.elapsed = 0;
        this.cancelled = false;
        this.paused = false
    }
    Interpolation.prototype = {
        cycle: function(e) {
            if (!this.paused) {
                if (this.delayLeft > 0) {
                    this.delayLeft -= e;
                    this.object[this.property] = this.from
                }
                if (this.delayLeft <= 0) {
                    this.elapsed += e;
                    if (this.elapsed >= this.duration) {
                        this.finish()
                    } else {
                        this.progress()
                    }
                }
            }
        },
        finish: function() {
            this.object[this.property] = this.to;
            this.onFinish.call(this)
        },
        cancel: function() {
            this.cancelled = true
        },
        isFinished: function() {
            return this.elapsed >= this.duration || this.cancelled
        },
        progress: function() {
            this.object[this.property] = this.applyFunction(this.easing, this.duration, this.from, this.to, this.elapsed, this.easingParameter)
        },
        invert: function() {
            this.elapsed = 0;
            var from = this.from;
            this.from = this.to;
            this.to = from
        },
        repeat: function() {
            this.elapsed = 0
        },
        pause: function() {
            this.paused = true
        },
        resume: function() {
            this.paused = false
        }
    };
    var TweenPool = {
        tweens: [],
        speedFactor: 1,
        cycle: function(e) {
            var i = 0;
            while (this.tweens[i]) {
                this.tweens[i].cycle(e * this.speedFactor);
                if (!this.tweens[i].isFinished()) {
                    i++
                } else {
                    this.tweens.splice(i, 1)
                }
            }
        },
        remove: function(tw) {
            var index = this.tweens.indexOf(tw);
            if (index >= 0) {
                this.tweens.splice(index, 1)
            }
        },
        add: function(tw) {
            this.tweens.push(tw)
        },
        clear: function() {
            this.tweens = []
        }
    };
    var ColorUtils = {
        fromString: function(s) {
            if (s.charAt(0) == "#") {
                return this.fromHex(s)
            }
            return null
        },
        fromHex: function(hex) {
            hex = hex.replace("#", "");
            var sr = hex.substr(0, 2);
            var sg = hex.substr(2, 2);
            var sb = hex.substr(4, 2);
            var sa = hex.substr(6, 2);
            var a = sa.length > 0 ? parseInt(sa) || 0 : 1;
            return {
                r: parseInt(sr, 16) || 0,
                g: parseInt(sg, 16) || 0,
                b: parseInt(sb, 16) || 0,
                a: a
            }
        },
        toString: function(c) {
            return "rgba(" + ~~c.r + "," + ~~c.g + "," + ~~c.b + "," + c.a + ")"
        },
        easingApply: function(easing, duration, from, to, elapsed, easingParam) {
            var c1 = ColorUtils.fromString(from);
            var c2 = ColorUtils.fromString(to);
            var c3 = {
                r: Util.limit(easing(elapsed, c1.r, c2.r - c1.r, duration, easingParam), 0, 255),
                g: Util.limit(easing(elapsed, c1.g, c2.g - c1.g, duration, easingParam), 0, 255),
                b: Util.limit(easing(elapsed, c1.b, c2.b - c1.b, duration, easingParam), 0, 255),
                a: Util.limit(easing(elapsed, c1.a, c2.a - c1.a, duration, easingParam), 0, 1)
            };
            return ColorUtils.toString(c3)
        }
    };
    var P = {
        width: 640,
        height: 920,
        cocoon: !!window.isCocoon,
        amazon: location.search.indexOf("amazon") >= 0,
        highscoreKey: "remvst-was-here-again",
        tutorialKey: "remvst-was-here-for-the-tutorial",
        showFrameRate: location.search.indexOf("fps") >= 0,
        pointsPerFlip: 20,
        pointsPerItem: 100,
        pointsPerRain: 500,
        powerLoss: .07,
        powerGain: .25
    };
    window.addToHomeConfig = {
        touchIcon: true,
        autostart: false
    };
    var AdsSettings = {
        ads: {
            tablet: {
                slot: "/20973361/game8_iPad_300x600",
                width: 300,
                height: 600,
                interval: 2,
                check: function() {
                    return navigator.userAgent.toLowerCase().indexOf("ipad") >= 0
                }
            },
            mobile: {
                slot: "/20973361/game8_mobile_300x250",
                width: 300,
                height: 250,
                interval: 2,
                check: function() {
                    return Util.isTouchScreen()
                }
            },
            web: {
                slot: "/20973361/game8_desktop_300x600",
                width: 300,
                height: 600,
                interval: 2,
                check: function() {
                    return !Util.isTouchScreen()
                }
            }
        }
    };
    var resources = {
        folder: "img/",
        image: {
            halo: "halo.png",
            moon: "moon.png",
            space: "space.png",
            alpaca_menu: "alpaca-menu.png",
            logo: "logo.png",
            alpaca_end: "alpaca-end.png"
        },
        sprite: {
            asteroid1: {
                sheet: "spritesheet.png",
                x: 0,
                y: 338,
                width: 350,
                height: 215
            },
            asteroid2: {
                sheet: "spritesheet.png",
                x: 350,
                y: 338,
                width: 350,
                height: 215
            },
            button_play: {
                sheet: "spritesheet.png",
                x: 0,
                y: 0,
                width: 221,
                height: 221
            },
            button_kik: {
                sheet: "spritesheet.png",
                x: 220,
                y: 0,
                width: 170,
                height: 161
            },
            button_leaderboard: {
                sheet: "spritesheet.png",
                x: 390,
                y: 0,
                width: 170,
                height: 161
            },
            button_retry: {
                sheet: "spritesheet.png",
                x: 560,
                y: 0,
                width: 170,
                height: 161
            },
            warning: {
                sheet: "spritesheet.png",
                x: 0,
                y: 221,
                width: 123,
                height: 117
            },
            triangle: {
                sheet: "spritesheet.png",
                x: 123,
                y: 221,
                width: 60,
                height: 58
            },
            asteroid_obstacle: {
                sheet: "spritesheet.png",
                x: 364,
                y: 161,
                width: 59,
                height: 60
            },
            satellite1: {
                sheet: "spritesheet.png",
                x: 423,
                y: 161,
                width: 152,
                height: 98
            },
            satellite2: {
                sheet: "spritesheet.png",
                x: 575,
                y: 161,
                width: 109,
                height: 52
            },
            dish: {
                sheet: "spritesheet.png",
                x: 123,
                y: 279,
                width: 90,
                height: 59
            },
            saucer: {
                sheet: "spritesheet.png",
                x: 575,
                y: 213,
                width: 106,
                height: 78
            },
            lettuce: {
                sheet: "spritesheet.png",
                x: 220,
                y: 273,
                width: 58,
                height: 54
            },
            alpaca_dead: {
                sheet: "spritesheet.png",
                x: 220,
                y: 161,
                width: 72,
                height: 112
            },
            alpaca: {
                sheet: "spritesheet.png",
                x: 292,
                y: 161,
                width: 72,
                height: 112
            }
        },
        pattern: {}
    };
    var R = {};
    DOM.on(window, "load", function() {
        DOM.un(window, "load", arguments.callee);
        Tracker.beginStage("loading");
        can = DOM.get("gamecanvas");
        can.width = P.width;
        can.height = P.height;
        var dpr = window.devicePixelRatio || 1;
        if (dpr < 2) {
            can.width /= 2;
            can.height /= 2
        }
        ctx = can.getContext("2d");
        if (!Util.isTouchScreen()) {
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", "css/desktop.css");
            document.head.appendChild(link)
        }
        window.resizer = new Resizer({
            element: DOM.get("viewport"),
            delay: 50,
            baseWidth: P.width,
            baseHeight: P.height,
            onResize: function() {
                window.scrollTo(0, 1)
            }
        });
        var getDimensionsAndResize = function() {
            if (!P.cocoon) {
                var w = window.innerWidth;
                var h = window.innerHeight;
                if (!Util.isTouchScreen()) {
                    w *= .85;
                    h *= .85
                }
                this.resizer.needsResize(w, h)
            }
        };
        DOM.on(window, "resize orientationchange", getDimensionsAndResize);
        getDimensionsAndResize();
        var loader = new ResourceLoader(resources);
        loader.load(function(res) {
            R = res;
            if (dpr < 2) {
                ctx.scale(.5, .5)
            }
            if (Util.isTouchScreen()) {
                window.scrollTo(0, 1)
            }
            new Game(resizer)
        }, can)
    });

    function Game() {
        Game.instance = this;
        window.G = this;
        this.curScreen = null;
        this.curOverlay = null;
        this.playedTutorial = !!Util.storage.getItem(P.tutorialKey) || false;
        this.highscore = parseInt(Util.storage.getItem(P.highscoreKey)) || 0;
        if (location.search.indexOf("newgame") >= 0) {
            this.playedTutorial = false;
            this.highscore = 0
        }
        this.attempts = 0;
        this.menu();
        this.lastCycleDate = Date.now();
        this.soundManager = new SoundManager({
            sounds: [{
                id: "music",
                urls: P.cocoon ? ["sound/music_long.mp3", "sound/music_long.ogg"] : ["sound/music.mp3", "sound/music.ogg", "sound/music.wav"],
                loop: true,
                volume: .3
            }, {
                id: "lose",
                urls: ["sound/lose.mp3", "sound/lose.ogg", "sound/lose.wav"]
            }, {
                id: "item",
                urls: ["sound/eat.mp3", "sound/eat.ogg", "sound/eat.wav"]
            }]
        });
        cycleManager.init(this.cycle.bind(this));
        DOM.on(document.body, "touchstart mousedown", this.handleDownEvent.bind(this));
        DOM.on(document.body, "touchmove mousemove", this.handleMoveEvent.bind(this));
        DOM.on(document.body, "touchend mouseup", this.handleUpEvent.bind(this));
        DOM.on(document.body, "keydown", this.handleKeyDownEvent.bind(this));
        DOM.on(document.body, "keyup", this.handleKeyUpEvent.bind(this));
        DOM.on(document.body, "mousewheel DOMMouseScroll", this.handleWheelEvent.bind(this));
        DOM.on(window, "deviceorientation", this.handleOrientationChange.bind(this));
        DOM.on("ad-close-button", "click touchend", this.closeWebAd.bind(this));
        DOM.on("ad-overlay", "click touchend", this.closeWebAd.bind(this));
        this.initAds();
        this.kikInit()
    }
    Game.prototype = {
        setScreen: function(screen) {
            this.setOverlay(null);
            if (this.curScreen) {
                this.curScreen.destroy()
            }
            this.curScreen = screen;
            this.curScreen.create();
            this.stage = this.curScreen.view;
            Tracker.beginStage("screen-" + screen.getId())
        },
        setOverlay: function(overlay) {
            if (this.curOverlay) {
                this.curOverlay.destroy();
                this.curOverlay = null
            }
            if (overlay) {
                this.curOverlay = overlay;
                this.curOverlay.create();
                this.stage.addChild(this.curOverlay.view);
                Tracker.beginStage("overlay-" + overlay.getId())
            }
        },
        cycle: function(elapsed) {
            this.lastCycleDate = Date.now();
            var before = Date.now();
            this.curScreen.cycle(elapsed);
            TweenPool.cycle(elapsed);
            var between = Date.now();
            this.stage.doRender(ctx);
            var after = Date.now();
            if (P.showFrameRate) {
                ctx.font = "20pt Arial";
                ctx.textAlign = "left";
                ctx.fillStyle = "red";
                ctx.fillText("FPS: " + cycleManager.fps, 10, 20);
                ctx.fillText("Total: " + (after - before), 10, 40);
                ctx.fillText("Cycle: " + (between - before), 10, 60);
                ctx.fillText("Render: " + (after - between), 10, 80);
                ctx.fillText("Theoretical: " + Math.round(1e3 / Math.max(1, after - before)), 10, 100);
                ctx.fillText("Size: " + this.stage.leaves(), 10, 120)
            }
        },
        getPosition: function(e) {
            if (e.touches) e = e.touches[0];
            var canRect = can.getBoundingClientRect();
            return {
                x: (e.clientX - canRect.left) / window.resizer.scaleX(),
                y: (e.clientY - canRect.top) / window.resizer.scaleY()
            }
        },
        handleDownEvent: function(e) {
            if (Date.now() - this.lastCycleDate >= 1e3) {
                cycleManager.stop();
                cycleManager.resume()
            }
            var evtType = e.type.indexOf("touch") >= 0 ? "touch" : "mouse";
            this.inputType = this.inputType || evtType;
            if (evtType != this.inputType) return;
            if (this.down) return;
            this.down = true;
            this.lastEvent = this.getPosition(e);
            (this.curOverlay || this.curScreen).touchStart(this.lastEvent.x, this.lastEvent.y);
            if (evtType == "touch") {}
        },
        handleMoveEvent: function(e) {
            this.lastEvent = this.getPosition(e);
            if (this.down) {
                e.preventDefault();
                (this.curOverlay || this.curScreen).touchMove(this.lastEvent.x, this.lastEvent.y)
            } else {
                (this.curOverlay || this.curScreen).mouseMove(this.lastEvent.x, this.lastEvent.y)
            }
            var area = (this.curOverlay || this.curScreen).areaContains(this.lastEvent.x, this.lastEvent.y);
            if (!area) {
                can.style.cursor = "default"
            } else {
                can.style.cursor = area.cursor
            }
            if (this.inputType == "touch") {
                e.preventDefault()
            }
        },
        handleUpEvent: function(e) {
            if (this.down) {
                (this.curOverlay || this.curScreen).touchEnd(this.lastEvent.x, this.lastEvent.y);
                this.down = false;
                this.lastEvent = null
            }
            window.scrollTo(0, 1)
        },
        handleKeyDownEvent: function(e) {
            (this.curOverlay || this.curScreen).keyDown(e.keyCode)
        },
        handleKeyUpEvent: function(e) {
            (this.curOverlay || this.curScreen).keyUp(e.keyCode)
        },
        handleWheelEvent: function(e) {
            var delta = Util.limit(e.wheelDelta || -e.detail, -1, 1);
            (this.curOverlay || this.curScreen).mouseWheel(delta)
        },
        handleOrientationChange: function(e) {
            this.hasAccelerometer = true;
            (this.curOverlay || this.curScreen).orientationChange(e.alpha, e.beta, e.gamma)
        },
        menu: function() {
            if (window.crossPromo) {
                crossPromo.show()
            }
            this.setScreen(new MainMenuScreen(this))
        },
        newAttempt: function() {
            if (window.crossPromo) {
                crossPromo.hide()
            }
            if (this.attempts == 0 && Detect.isIOS()) {
                this.soundManager.play("eat")
            }
            this.attempts++;
            this.setScreen(new GameplayScreen(this));
            addToHome.close()
        },
        end: function(reason) {
            if (window.crossPromo) {
                crossPromo.show();
                console.log("Showing cross promo")
            }
            if (this.attempts == 2) {
                addToHome.show()
            }
            var score = this.curScreen.score;
            this.previousHighscore = this.highscore;
            this.highscore = Math.max(score, this.highscore);
            Util.storage.setItem(P.highscoreKey, this.highscore);
            window.gmga("gamedone");
            this.setScreen(new EndScreen(this, this.curScreen.score, reason));
            gmapi(function(api) {
                api.game.leaderboard.sendScore(score)
            });
            if (this.attempts % this.adInterval == 0) {
                setTimeout(this.showAd.bind(this), 700)
            }
            var hundreds = ~~(score / 250);
            var tier = hundreds * 250;
            Tracker.event("result", "tier-" + tier + "-" + (tier + 250))
        },
        initAds: function() {
            if (P.cocoon) {
                this.initNativeAds()
            } else {
                this.initWebAds()
            }
        },
        initNativeAds: function() {
            if (!this.nativeAdsInitialized) {
                this.adInterval = 2;
                this.nativeAdsInitialized = true;
                this.nativeAdsReady = false;
                console.log("Initializing cocoon native ads");
                var me = this;
                CocoonJS.Ad.onFullScreenShown.addEventListener(function() {
                    console.log("fullscreen shown");
                    CocoonJS.Ad.refreshFullScreen()
                });
                CocoonJS.Ad.onFullScreenHidden.addEventListener(function() {
                    console.log("fullscreen hidden")
                });
                CocoonJS.Ad.onFullScreenReady.addEventListener(function() {
                    console.log("fullscreen ready");
                    me.nativeAdsReady = true
                });
                setTimeout(function() {
                    CocoonJS.Ad.preloadFullScreen()
                }, 1e3)
            }
        },
        showAd: function() {
//            alert("showAd");
//            console.log("Trying to show an ad");
//            if (this.googleAdsInitted) {
//                this.showWebAd()
//            } else if (P.cocoon) {
//                this.showNativeAd()
//            }
        },
        showNativeAd: function() {
            console.log("Showing a native ad");
            return CocoonJS.Ad.showFullScreen()
        },
        initWebAds: function() {
            var ad, iframe, container, me = this;
            if (this.googleAdsInitted) {
                return
            }
            this.adCreated = false;
            this.googleAdsInitted = true;
            for (var i in AdsSettings.ads) {
                if (AdsSettings.ads[i].check()) {
                    ad = AdsSettings.ads[i];
                    break
                }
            }
            if (ad) {
                this.adSettings = ad;
                this.adSlot = null;
                this.adInterval = ad.interval;
                googletag.cmd.push(function() {
                    me.adSlot = googletag.defineSlot(ad.slot, [ad.width, ad.height], "ad").addService(googletag.pubads());
                    googletag.pubads().enableSingleRequest();
                    googletag.enableServices();
                    me.adCreated = true;
                    googletag.display("ad");
                    Tracker.event("ad-web", "ad-web-initialize-success")
                });
                var container = DOM.get("ad-container");
                container.style.width = ad.width + "px";
                container.style.height = ad.height + "px"
            }
        },
        showWebAd: function() {
            if (!this.webAdOpen && this.adSettings) {
                this.webAdOpen = true;
                googletag.cmd.push(function() {
                    googletag.pubads().refresh([me.adSlot])
                });
                DOM.show("ad-overlay");
                Tracker.event("ad-web", "ad-web-show-success")
            }
        },
        closeWebAd: function() {
            if (this.webAdOpen) {
                this.webAdOpen = false;
                DOM.hide("ad-overlay");
                Tracker.event("ad-web", "ad-web-close")
            }
        },
        kikInit: function() {
            if (window.kik) {
                var kik = window.kik;
                if (kik.push) {
                    if (kik.push.handler) {
                        kik.push.handler(function(data) {
                            Tracker.event("kik-push-notification", "open")
                        })
                    }
                    if (kik.push.getToken) {
                        kik.push.getToken(function(token) {
                            if (token) {
                                Ajax.send("tokencollect", "post", {
                                    token: token
                                })
                            }
                        })
                    }
                }
                if (kik.browser) {
                    if (kik.browser.setOrientationLock) {
                        kik.browser.setOrientationLock("portrait")
                    }
                    if (kik.browser.statusBar) {
                        kik.browser.statusBar(false)
                    }
                    if (kik.browser.backlightTimeout) {
                        kik.browser.backlightTimeout(false)
                    }
                }
                if (kik.message) {
                    Tracker.event("kik-message", "kik-message-open")
                }
            }
        },
        disableTutorial: function() {
            this.playedTutorial = true;
            Util.storage.setItem(P.tutorialKey, true)
        }
    };

    function Screen(game) {
        this.game = game;
        this.areas = [];
        this.currentActionArea = null;
        this.view = null
    }
    Screen.prototype = {
        getId: function() {
            return "unnamed"
        },
        cycle: function(elapsed) {},
        touchStart: function(x, y) {
            for (var i in this.areas) {
                if (this.areas[i].enabled && this.areas[i].contains(x, y)) {
                    this.currentActionArea = this.areas[i];
                    this.currentActionArea.actionStart(x, y);
                    break
                }
            }
        },
        touchMove: function(x, y) {
            if (this.currentActionArea) {
                if (!this.currentActionArea.contains(x, y)) {
                    this.currentActionArea.actionCancel(x, y);
                    this.currentActionArea = null
                } else {
                    this.currentActionArea.actionMove(x, y)
                }
            }
        },
        touchEnd: function(x, y) {
            if (this.currentActionArea && this.currentActionArea.contains(x, y)) {
                this.currentActionArea.actionPerformed(x, y)
            }
            this.currentActionArea = null
        },
        keyDown: function(keyCode) {},
        keyUp: function(keyCode) {},
        mouseWheel: function(delta) {},
        orientationChange: function(alpha, beta, gamma) {},
        mouseMove: function(x, y) {},
        create: function() {},
        destroy: function() {},
        addArea: function(area) {
            this.areas.push(area)
        },
        areaContains: function(x, y) {
            for (var i in this.areas) {
                if (this.areas[i].enabled && this.areas[i].contains(x, y)) {
                    return this.areas[i]
                }
            }
            return null
        }
    };

    function Area(settings) {
        settings = settings || {};
        this.x = settings.x || 0;
        this.y = settings.y || 0;
        this.width = settings.width || 0;
        this.height = settings.height || 0;
        this.cursor = settings.cursor || "pointer";
        this.onactionperformed = settings.actionPerformed || noop;
        this.onactionstart = settings.actionStart || noop;
        this.onactioncancel = settings.actionCancel || noop;
        this.onactionmove = settings.actionMove || noop;
        this.enabled = true
    }
    Area.prototype = {
        contains: function(x, y) {
            return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
        },
        actionPerformed: function(x, y) {
            this.onactionperformed(x, y)
        },
        actionStart: function(x, y) {
            this.onactionstart(x, y)
        },
        actionCancel: function(x, y) {
            this.onactioncancel(x, y)
        },
        actionMove: function(x, y) {
            this.onactionmove(x, y)
        }
    };

    function Button(settings) {
        DisplayableContainer.call(this);
        Area.call(this, 0, 0, 0, 0);
        this.enabled = true;
        this.pressed = false;
        this.setup(settings)
    }
    Button.prototype = extendPrototype([DisplayableContainer, Area], {
        setup: function(settings) {
            this.action = settings.action || this.action || noop;
            if ("enabled" in settings) {
                this.enabled = settings.enabled
            }
            this.bgColor = settings.bgColor || "#ffffff";
            this.borderColor = settings.lineColor || "#000";
            this.borderRadius = isNaN(settings.borderRadius) ? 10 : settings.borderRadius;
            this.textColor = settings.textColor || "#000";
            this.textFont = settings.textFont || "Arial";
            this.fontSize = settings.fontSize || 20;
            this.outlineColor = settings.outlineColor || "#000";
            this.outlineWidth = settings.outlineWidth || 0;
            this.id = settings.id || undefined;
            this.setContent(settings.content);
            this.width = settings.width || this.width || 404;
            this.height = settings.height || this.height || 125
        },
        setContent: function(arg0) {
            this.text = this.image = null;
            if (arg0.length) {
                this.type = "text";
                this.text = arg0;
                this.id = this.text
            } else if (arg0.width) {
                this.type = "image";
                this.image = arg0;
                this.width = this.width || arg0.width;
                this.height = this.height || arg0.height
            } else {
                this.type = "object";
                this.addChild(arg0)
            }
        },
        render: function(c) {
            c.globalAlpha *= this.pressed ? .5 : 1;
            c.font = this.fontSize + "pt " + this.textFont;
            c.textAlign = "center";
            c.textBaseline = "middle";
            if (this.type == "text") {
                c.fillStyle = this.textColor;
                c.fillText(this.text, this.width / 2, this.height / 2)
            } else if (this.type == "image") {
                c.drawImage(this.image, 0, 0, this.image.width, this.image.height, (this.width - this.image.width) / 2, (this.height - this.image.height) / 2, this.image.width, this.image.height)
            }
            if (this.outlineWidth > 0) {
                c.lineWidth = this.outlineWidth;
                c.strokeStyle = this.outlineColor;
                c.strokeText(this.text, this.width / 2, this.height / 2 + 3)
            }
            DisplayableContainer.prototype.render.call(this, c)
        },
        actionPerformed: function(x, y) {
            this.pressed = false;
            if (this.enabled) {
                this.action();
                if (this.id) {
                    Tracker.event("button-click", "button-" + this.id)
                }
            }
        },
        actionStart: function(x, y) {
            this.pressed = true
        },
        actionCancel: function(x, y) {
            this.pressed = false
        }
    });

    function SoundManager(settings) {
        this.soundMap = {};
        this.loadSettings(settings)
    }
    SoundManager.prototype = {
        loadSettings: function(settings) {
            this.volume = isNaN(settings.volume) ? 1 : settings.volume;
            for (var i in settings.sounds) {
                this.soundMap[settings.sounds[i].id] = this.prepareSound(settings.sounds[i])
            }
        },
        prepareSound: function(settings) {
            return new Howl({
                urls: settings.urls,
                volume: (settings.volume || 1) * this.volume,
                loop: !!settings.loop,
                preload: true
            })
        },
        play: function(id) {
            if (this.soundMap[id]) {
                var soundObject = this.soundMap[id];
                this.soundMap[id].play(function(id) {
                    soundObject.instanceId = id
                })
            }
        },
        stop: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].stop(this.soundMap[id].instanceId)
            }
        },
        pause: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].pause(this.soundMap[id].instanceId)
            }
        },
        fadeOut: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].fadeOut(this.soundMap[id].instanceId)
            }
        }
    };
    (function() {
        if (!P.cocoon) {
            (function(i, s, o, g, r, a, m) {
                i["GoogleAnalyticsObject"] = r;
                i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date;
                a = s.createElement(o), m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, "script", "//www.google-analytics.com/analytics.js", "ga")
        } else if (!window.cordova) {
            var interfaceReady = false;
            var queue = [];
            var flushQueue = function() {
                var cmd;
                while (cmd = queue.shift()) {
                    forwardCmd(cmd)
                }
            };
            var forwardCmd = function(cmd) {
                console.log("Sending " + cmd + " to the Webview");
                CocoonJS.App.forwardAsync(cmd)
            };
            var addToQueue = function(cmd) {
                queue.push(cmd);
                if (interfaceReady) {
                    flushQueue()
                }
            };
            window.gaInterfaceIsReady = function() {
                CocoonJS.App.forwardAsync("CocoonJS.App.show(0, 0, " + window.innerWidth * window.devicePixelRatio + "," + window.innerHeight * window.devicePixelRatio + ");");
                interfaceReady = true;
                flushQueue()
            };
            console.log("Creating GAI interface");
            CocoonJS.App.loadInTheWebView("http://more.gamemix.com/cocoonoverlay.html?currentGame=astroalpaca");
            window.ga = function() {
                var args = "";
                for (var i = 0; i < arguments.length; i++) {
                    if (i > 0) {
                        args += ","
                    }
                    args += JSON.stringify(arguments[i])
                }
                var cmd = "window.ga(" + args + ")";
                addToQueue(cmd)
            };
            console.log("webview loading")
        }
        ga("require", "displayfeatures");
        ga("create", "UA-53429407-1");
        (function(g, m, c, d, a) {
            g["GameMixGA"] = a;
            g[a] = g[a] || function(f) {
                g[a].q = g[a].q || [];
                g[a].q.push(f)
            };
            g[a]({
                gmgaDomain: d
            });
            var s = m.createElement(c),
                p = m.getElementsByTagName(c)[0];
            s.type = "text/javascript";
            s.async = true;
            s.src = d + "/client/gmga.js";
//            p.parentNode.insertBefore(s, p)
        })(window, document, "script", "http://gmga.gamemix.com", "gmga");
//        gmga("astroalpaca")
    })();
    var Tracker = {
        suffix: function() {
            if ("standalone" in window.navigator && navigator.standalone) {
                return "-homescreen"
            } else if (window.cordova || P.cocoon) {
                return "-native"
            } else if (window.kik && kik.send) {
                return "-kik"
            } else if (P.amazon) {
                return "-amazon"
            } else {
                return "-web"
            }
        },
        event: function(eventCategory, eventLabel, eventValue) {
            if (window.cordova && window.gaPlugin) {
                gaPlugin.trackEvent(function() {
                    console.log("Sent event data")
                }, function(e) {
                    console.log("Error while sending event data: " + e)
                }, "gameevent", eventCategory + this.suffix(), eventLabel + this.suffix(), eventValue || 0)
            } else if (window.ga) {
                ga("send", "event", "gameevent", eventCategory + this.suffix(), eventLabel + this.suffix(), eventValue || 0)
            }
        },
        beginStage: function(stageLabel) {
            var page = "/stage-" + stageLabel + this.suffix();
            if (window.cordova && window.gaPlugin) {
                gaPlugin.trackPage(function() {
                    console.log("Sent page view")
                }, function(e) {
                    console.log("Error while sending page view: " + e)
                }, page)
            } else if (window.ga) {
                ga("send", "pageview", page)
            }
        }
    };

    function MainMenuScreen(game) {
        Screen.call(this, game)
    }
    MainMenuScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "mainmenu"
        },
        create: function() {
            this.view = new DisplayableContainer;
            this.bg = new CachedContainer;
            this.bg.width = P.width;
            this.bg.height = P.height;
            this.view.addChild(this.bg);
            var space = new DisplayableImage;
            space.image = R.image.space;
            this.bg.addChild(space);
            var alpaca = new DisplayableImage;
            alpaca.image = R.image.alpaca_menu;
            alpaca.x = 250;
            alpaca.y = 300;
            this.view.addChild(alpaca);
            var logo = new DisplayableImage;
            logo.image = R.image.logo;
            logo.y = 70;
            this.bg.addChild(logo);
            this.playButton = new Button({
                id: "play",
                content: "Play",
                content: R.sprite.button_play,
                textColor: "white",
                action: this.play.bind(this)
            });
            this.playButton.x = 50;
            this.playButton.y = 470;
            if (!P.cocoon) {
                this.bg.addChild(this.playButton)
            } else {
                this.view.addChild(this.playButton)
            }
            this.addArea(this.playButton);
            TweenPool.add(new Interpolation({
                object: alpaca,
                property: "x",
                from: alpaca.x - 10,
                to: alpaca.x + 10,
                duration: 3,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            TweenPool.add(new Interpolation({
                object: alpaca,
                property: "y",
                from: alpaca.y - 10,
                to: alpaca.y + 10,
                duration: 3.5,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            TweenPool.add(new Interpolation({
                object: alpaca,
                property: "rotation",
                from: -Math.PI / 32,
                to: Math.PI / 32,
                duration: 4,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            if (P.cocoon) {
                TweenPool.add(new Interpolation({
                    object: this.playButton,
                    property: "x",
                    from: this.playButton.x + 10,
                    to: this.playButton.x - 10,
                    duration: 4,
                    easing: Math.easeInOutCubic,
                    onFinish: function() {
                        this.invert()
                    }
                }));
                TweenPool.add(new Interpolation({
                    object: this.playButton,
                    property: "y",
                    from: this.playButton.y + 10,
                    to: this.playButton.y - 10,
                    duration: 4.6,
                    easing: Math.easeInOutCubic,
                    onFinish: function() {
                        this.invert()
                    }
                }));
                TweenPool.add(new Interpolation({
                    object: this.playButton,
                    property: "rotation",
                    from: -Math.PI / 64,
                    to: Math.PI / 64,
                    duration: 5,
                    easing: Math.easeInOutCubic,
                    onFinish: function() {
                        this.invert()
                    }
                }))
            }
        },
        play: function() {
            this.game.newAttempt()
        },
        touchStart: function() {
            Screen.prototype.touchStart.apply(this, arguments);
            this.bg.renewCache()
        },
        touchMove: function() {
            Screen.prototype.touchMove.apply(this, arguments);
            this.bg.renewCache()
        },
        touchEnd: function() {
            Screen.prototype.touchEnd.apply(this, arguments);
            this.bg.renewCache()
        }
    });

    function EndScreen(game, score, reason) {
        Screen.call(this, game);
        this.score = score || 3132;
        this.reason = reason
    }
    EndScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "end"
        },
        create: function() {
            this.view = new DisplayableContainer;
            var space = new DisplayableImage;
            space.image = R.image.space;
            this.view.addChild(space);
            var moon = new DisplayableImage;
            moon.image = R.image.moon;
            moon.anchorX = -moon.image.width / 2;
            moon.anchorY = -moon.image.height / 2;
            moon.x = 50;
            moon.y = 100;
            this.view.addChild(moon);
            TweenPool.add(new Interpolation({
                object: moon,
                property: "rotation",
                from: 0,
                to: Math.PI * 2,
                duration: 100,
                onFinish: function() {
                    this.repeat()
                }
            }));
            this.scoreTf = new DisplayableTextField;
            this.view.addChild(this.scoreTf);
            with(this.scoreTf) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#ffffff";
                text = this.score.toString();
                font = "70pt Museo";
                x = P.width / 2;
                y = 100
            }
            this.highscoreTf = new DisplayableTextField;
            this.view.addChild(this.highscoreTf);
            with(this.highscoreTf) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#ffffff";
                text = "Highscore: " + this.game.highscore;
                font = "30pt Museo";
                x = P.width / 2;
                y = 180
            }
            this.alpaca = new DisplayableImage;
            this.alpaca.image = R.image.alpaca_end;
            this.alpaca.anchorX = -this.alpaca.image.width / 2;
            this.alpaca.anchorY = -this.alpaca.image.height / 2;
            this.alpaca.x = P.width / 2;
            this.alpaca.y = 400;
            this.view.addChild(this.alpaca);
            TweenPool.add(new Interpolation({
                object: this.alpaca,
                property: "x",
                from: this.alpaca.x - 10,
                to: this.alpaca.x + 10,
                duration: 3,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            TweenPool.add(new Interpolation({
                object: this.alpaca,
                property: "y",
                from: this.alpaca.y - 10,
                to: this.alpaca.y + 10,
                duration: 3.5,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            TweenPool.add(new Interpolation({
                object: this.alpaca,
                property: "rotation",
                from: -Math.PI / 32,
                to: Math.PI / 32,
                duration: 4,
                easing: Math.easeInOutCubic,
                onFinish: function() {
                    this.invert()
                }
            }));
            var quotes = ["You did well, brave AstroAlpaca.", "remvst was here.", "www.gamemix.com, you should visit.", "Asteroids push debris everywhere. Be careful.", "Analyzing the situation, you should/", "He's dead, Jim.", "Use the force.", "You've done well, young AstroAlpaca.", "You have a lot to learn, young AstroAlpaca.", "Another one bites the space dust.", "You won't reach the top of the leaderboard like this.", "It's a bird! It's a plane! It's an AstroAlpaca!."];
            if (this.reason === "asteroid") {
                quotes.push("That asteroid, you could have avoided.");
                quotes.push("An umbrella, you could have brought.");
                quotes.push("These rains are dangerous.")
            } else if (this.reason === "power") {
                quotes.push("Your power meter, you should watch.");
                quotes.push("Eat your lettuce, you should.");
                quotes.push("Eat your vegetables!");
                quotes.push("Space lettuce is full of proteins. You should eat it.")
            } else if (this.reason === "obstacle") {
                quotes.push("That debris fell faster than expected.");
                quotes.push("Debris are not edible. Eat space lettuce instead.")
            }
            if (this.score >= this.game.highscore) {
                if (this.game.previousHighscore > 0) {
                    quotes = []
                }
                quotes.push("A new highscore, you just got.");
                quotes.push("That new highscore, you should brag about.")
            }
            this.quoteTf = new MultilineTextField;
            this.view.addChild(this.quoteTf);
            with(this.quoteTf) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#ffffff";
                text = '"' + Util.randomPick.apply(null, quotes) + '"';
                font = "25pt MuseoThin";
                x = P.width / 2;
                y = 650;
                maxWidth = P.width;
                lineHeight = 50
            }
            var me = this;
            var buttons = [];
            if (!this.game.levelUnlocked) {
                buttons.push(new Button({
                    id: "retry",
                    content: R.sprite.button_retry,
                    action: this.retry.bind(this)
                }))
            }
            if (!P.cocoon) {
//                buttons.push(new Button({
//                    id: "leaderboard",
//                    content: R.sprite.button_leaderboard,
//                    action: this.leaderboard.bind(this)
//                }))
            }
            if (window.kik && kik.send) {
                buttons.push(new Button({
                    id: "kik",
                    content: R.sprite.button_kik,
                    action: this.kik.bind(this)
                }))
            }
            var buttonWidth = 200;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].x = (i + .5 - buttons.length / 2) * buttonWidth + P.width / 2 - buttons[i].width / 2;
                buttons[i].y = P.height - 200;
                this.view.addChild(buttons[i]);
                this.addArea(buttons[i])
            }
        },
        retry: function() {
            this.game.newAttempt()
        },
        leaderboard: function() {
            var me = this;
            setTimeout(function() {
                gmapi(function(api) {
//                    api.game.leaderboard.show()
                })
            }, 500)
        },
        kik: function() {
            kik.send({
                title: "I scored " + this.score + " on AstroAlpaca!",
                text: "Can you beat me?",
                pic: "promo/icon-128x128.png",
                data: {
                    score: this.score,
                    date: Date.now()
                }
            })
        }
    });

    function GameplayScreen(game) {
        Screen.call(this, game)
    }
    GameplayScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "gameplay"
        },
        create: function() {
            this.view = new DisplayableContainer;
            var space = new DisplayableImage;
            space.image = R.image.space;
            this.view.addChild(space);
            this.bgEffect = new BackgroundEffect;
            this.view.addChild(this.bgEffect);
            this.content = new DisplayableContainer;
            this.view.addChild(this.content);
            this.cyclables = [];
            this.arrays = {
                obstacle: []
            };
            this.character = new Character(this);
            this.character.enableHalo();
            this.addCyclable(this.character);
            this.controller = new HybridController(this);
            this.started = false;
            this.ended = false;
            this.character.setPosition(P.width / 2, P.height / 2, true);
            this.blockInterval = 1;
            this.score = 0;
            this.power = 1;
            this.paused = false;
            this.hud = new DisplayableContainer;
            this.view.addChild(this.hud);
            this.hudPower = new DisplayableContainer;
            this.hudPower.visible = false;
            this.hud.addChild(this.hudPower);
            this.hudScore = new DisplayableContainer;
            this.hudScore.visible = false;
            this.hud.addChild(this.hudScore);
            this.powerLabel = new DisplayableTextField;
            this.hudPower.addChild(this.powerLabel);
            with(this.powerLabel) {
                x = 40;
                y = 50;
                color = "#ffffff";
                shadowColor = "#000";
                shadowOffsetX = 4;
                shadowOffsetY = 4;
                font = "30pt Museo";
                textAlign = "left";
                textBaseline = "middle";
                text = "Power"
            }
            this.powerMeter = new PowerMeter(this);
            this.powerMeter.x = 40;
            this.powerMeter.y = 80;
            this.hudPower.addChild(this.powerMeter);
            this.scoreLabel = new DisplayableTextField;
            this.hudScore.addChild(this.scoreLabel);
            with(this.scoreLabel) {
                x = P.width - 40;
                y = 50;
                color = "#ffffff";
                shadowColor = "#000";
                shadowOffsetX = 4;
                shadowOffsetY = 4;
                font = "30pt Museo";
                textAlign = "right";
                textBaseline = "middle";
                text = "Score"
            }
            this.scoreTf = new DisplayableTextField;
            this.hudScore.addChild(this.scoreTf);
            with(this.scoreTf) {
                x = P.width - 40;
                y = 100;
                color = "#ffffff";
                font = "40pt Museo";
                textAlign = "right";
                textBaseline = "middle";
                shadowColor = "#000";
                shadowOffsetX = 4;
                shadowOffsetY = 4
            }
            this.showMessage("Drag your alpaca to start", 60);
            this.pauseMessage = new MultilineTextField;
            this.view.addChild(this.pauseMessage);
            with(this.pauseMessage) {
                x = P.width / 2;
                y = ~~(P.height * .5);
                textAlign = "center";
                textBaseline = "middle";
                font = "bold 50pt Museo";
                text = "Game paused\n\nDrag your alpaca to resume.";
                color = "#caff00";
                shadowColor = "#03002e";
                shadowOffsetX = 8;
                shadowOffsetY = 8;
                maxWidth = P.width * .95;
                lineHeight = 60
            }
            var me = this;
            setTimeout(function() {
                me.game.soundManager.play("music")
            }, 100)
        },
        destroy: function() {
            this.game.soundManager.stop("music")
        },
        mouseMove: function(x, y) {
            this.touchMove(x, y)
        },
        touchStart: function(x, y) {
            this.controller.touchStart(x, y)
        },
        touchEnd: function(x, y) {
            this.controller.touchEnd(x, y)
        },
        touchMove: function(x, y) {
            this.controller.touchMove(x, y)
        },
        keyDown: function(keyCode) {
            this.controller.keyDown(keyCode)
        },
        keyUp: function(keyCode) {
            this.controller.keyUp(keyCode)
        },
        cycle: function(e) {
            if (this.paused && this.started && !this.ended) {
                this.pauseMessage.visible = true
            } else {
                this.pauseMessage.visible = false;
                if (!this.started && this.character.totalDistance > 200) {
                    this.started = true;
                    this.character.disableHalo();
                    this.hideMessage();
                    if (!this.game.playedTutorial) {
                        var me = this;
                        setTimeout(function() {
                            me.showMessage("Watch your power meter", 4);
                            var hide = function() {
                                me.hudPower.visible = false
                            };
                            var show = function() {
                                me.hudPower.visible = true
                            };
                            var step = 500;
                            for (var t = 0; t <= 1500; t += step) {
                                setTimeout(hide, t);
                                setTimeout(show, t + step / 2)
                            }
                        }, 1e3);
                        setTimeout(function() {
                            if (!me.pickedUpFirstItem) {
                                me.showMessage("Pick up space lettuce")
                            }
                        }, 4e3);
                        this.nextItem = 4
                    } else {
                        this.pickedUpFirstItem = true;
                        this.nextItem = 0;
                        this.nextBlock = 2;
                        this.nextAsteroid = 10;
                        this.hudScore.visible = true;
                        this.hudPower.visible = true;
                        this.nextRain = 40
                    }
                }
                this.bgEffect.cycle(e);
                this.controller.cycle(e);
                if (this.started) {
                    this.power = Util.limit(this.power - P.powerLoss * e, 0, 1);
                    if (this.power <= 0) {
                        this.gameOver("power")
                    }
                    if (this.pickedUpFirstItem) {
                        this.nextBlock -= e;
                        if (this.nextBlock <= 0) {
                            this.spawnBlock()
                        }
                        this.nextAsteroid -= e;
                        if (this.nextAsteroid <= 0) {
                            this.spawnAsteroid()
                        }
                        this.nextRain -= e;
                        if (this.nextRain <= 0) {
                            this.startAsteroidRain()
                        }
                    }
                    this.nextItem -= e;
                    if (this.nextItem <= 0) {
                        this.spawnItem()
                    }
                    this.scoreTf.text = this.score.toString()
                }
                var i = this.cyclables.length;
                while (this.cyclables[--i]) {
                    this.cyclables[i].cycle(e)
                }
            }
        },
        spawnBlock: function() {
            var dims = Util.randomPick({
                image: R.sprite.satellite1,
                width: 152,
                height: 80
            }, {
                image: R.sprite.triangle,
                width: 47,
                height: 47
            }, {
                image: R.sprite.satellite2,
                width: 109,
                height: 40
            }, {
                image: R.sprite.dish,
                width: 71,
                height: 47
            }, {
                image: R.sprite.asteroid_obstacle,
                width: 59,
                height: 59
            }, {
                image: R.sprite.saucer,
                width: 80,
                height: 60
            });
            var b = new FallingBlock(this, {
                x: Math.random() * P.width,
                width: dims.width,
                height: dims.height,
                image: dims.image
            });
            this.addCyclable(b);
            this.nextBlock = this.blockInterval;
            this.blockInterval = Math.max(this.blockInterval - .008, .4)
        },
        spawnItem: function() {
            var i = new Item(this, {
                x: Util.rand(100, P.width - 100),
                y: Util.rand(300, P.height - 100),
                duration: 1.5
            });
            this.addCyclable(i);
            this.nextItem = 2
        },
        spawnAsteroid: function() {
            var trajectory = Util.randomPick({
                from: -200,
                to: P.width + 300,
                variation: "x",
                warningX: 100
            }, {
                from: P.width + 200,
                to: -300,
                variation: "x",
                warningX: P.width - 100
            }, {
                from: -200,
                to: P.height + 300,
                variation: "y",
                warningY: 100
            });
            var delay = 1.5;
            var a = new Asteroid(this, {
                from: trajectory.from,
                to: trajectory.to,
                duration: 1,
                x: Util.rand(50, P.width - 50),
                y: Util.rand(50, P.height - 50),
                delay: delay,
                variation: trajectory.variation
            });
            this.addCyclable(a);
            var warning = new DisplayableImage;
            warning.image = R.sprite.warning;
            warning.anchorX = -warning.image.width / 2;
            warning.anchorY = -warning.image.height / 2;
            warning.x = trajectory.warningX || a.x;
            warning.y = trajectory.warningY || a.y;
            this.view.addChild(warning);
            var show = function() {
                warning.visible = true
            };
            var hide = function() {
                warning.visible = false
            };
            var step = 250;
            for (var t = step; t < 1e3; t += step) {
                setTimeout(hide, t);
                setTimeout(show, t + step / 2)
            }
            setTimeout(function() {
                warning.remove()
            }, delay * 1e3);
            this.nextAsteroid = 10
        },
        addCyclable: function(c) {
            this.cyclables.push(c);
            this.content.addChild(c);
            if (c.type) {
                this.arrays[c.type].push(c)
            }
        },
        removeCyclable: function(c) {
            var ind = this.cyclables.indexOf(c);
            if (ind >= 0) {
                this.cyclables.splice(ind, 1);
                c.remove();
                if (c.type) {
                    this.arrays[c.type].splice(this.arrays[c.type].indexOf(c), 1)
                }
            }
        },
        gameOver: function(reason, trajectory) {
            if (!this.ended) {
                this.hud.remove();
                this.ended = true;
                if (reason === "obstacle" || reason === "asteroid") {
                    var red = new DisplayableRectangle;
                    red.width = P.width;
                    red.height = P.height;
                    red.color = "#ff0000";
                    this.view.addChild(red);
                    TweenPool.add(new Tween(red, "alpha", 1, 0, .3, 0, function() {
                        this.object.remove()
                    }))
                } else if (reason === "power") {
                    this.showMessage("Power depleted")
                }
                this.character.deathAnimation(trajectory);
                navigator.vibrate(200);
                var me = this;
                setTimeout(function() {
                    me.game.end(reason)
                }, 2e3);
                this.game.soundManager.play("lose");
                window.location.href="objc://"+"gameOver:/0"; // by michael
            }
        },
        performedBackFlip: function() {
            this.performedTrick("Frontflip!", P.pointsPerFlip)
        },
        performedFrontFlip: function() {
            this.performedTrick("Backflip!", P.pointsPerFlip)
        },
        performedTrick: function(message, pts) {
            if (this.pickedUpFirstItem) {
                this.earned(pts);
                this.showMessage(message + " (+" + pts + ")")
            }
        },
        showMessage: function(t, d) {
            if (this.currentMessage) {
                this.currentMessage.remove()
            }
            this.currentMessage = new MultilineTextField;
            this.view.addChild(this.currentMessage);
            with(this.currentMessage) {
                x = P.width / 2;
                y = ~~(P.height * .33);
                textAlign = "center";
                textBaseline = "middle";
                font = "40pt Museo";
                text = t;
                color = "#ffffff";
                shadowColor = "#000";
                shadowOffsetX = 4;
                shadowOffsetY = 4;
                maxWidth = P.width * .95;
                lineHeight = 50
            }
            var me = this;
            clearTimeout(this.messageTo);
            this.messageTo = setTimeout(function() {
                me.hideMessage()
            }, (d || 1) * 1e3)
        },
        hideMessage: function() {
            this.currentMessage.remove()
        },
        earned: function(points) {
            if (!this.ended) {
                this.score += points;
                TweenPool.add(new Interpolation({
                    object: this.scoreTf,
                    property: "color",
                    from: "#00ff00",
                    to: "#ffffff",
                    duration: .3,
                    applyFunction: ColorUtils.easingApply
                }));
                TweenPool.add(new Interpolation({
                    object: this.scoreTf,
                    property: "scaleX",
                    from: 1.5,
                    to: 1,
                    duration: .3
                }));
                TweenPool.add(new Interpolation({
                    object: this.scoreTf,
                    property: "scaleY",
                    from: 1.5,
                    to: 1,
                    duration: .3
                }))
            }
        },
        pickedUpItem: function() {
            this.power = Math.min(this.power + P.powerGain, 1);
            if (!this.pickedUpFirstItem && !this.game.hasPlayedTutorial) {
                this.pickedUpFirstItem = true;
                this.showMessage("Lettuce gives you power and points", 99);
                var me = this;
                var hide = function() {
                    me.hudScore.visible = false
                };
                var show = function() {
                    me.hudScore.visible = true
                };
                var step = 500;
                for (var t = 0; t <= 1500; t += step) {
                    setTimeout(hide, t);
                    setTimeout(show, t + step / 2)
                }
                this.nextAsteroid = 10;
                this.nextBlock = 4;
                this.nextRain = 40;
                setTimeout(function() {
                    me.showMessage("Avoid space debris!");
                    me.game.disableTutorial()
                }, 4e3)
            }
        },
        startAsteroidRain: function() {
            var duration = 1e4;
            var step = 1e3;
            for (var t = step; t < duration; t += step) {
                setTimeout(this.spawnAsteroid.bind(this), t)
            }
            setTimeout(this.endAsteroidRain.bind(this), duration + 2e3);
            this.nextBlock = 99;
            this.showMessage("Asteroid rain!", 2);
            this.nextRain = 40
        },
        endAsteroidRain: function() {
            if (!this.ended) {
                this.showMessage("You survived the asteroid rain! (+" + P.pointsPerRain + ")", 2);
                this.earned(P.pointsPerRain)
            }
            this.nextBlock = 3
        },
        pause: function() {
            this.paused = true;
            if (this.currentMessage) {
                this.currentMessage.visible = false
            }
            this.character.enableHalo()
        },
        resume: function() {
            this.paused = false;
            if (this.currentMessage) {
                this.currentMessage.visible = true
            }
            this.character.disableHalo()
        }
    });

    function Character(screen) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.halo = new DisplayableImage;
        this.halo.image = R.image.halo;
        this.halo.anchorX = -this.halo.image.width / 2;
        this.halo.anchorY = -this.halo.image.height / 2;
        this.halo.visible = false;
        this.addChild(this.halo);
        var me = this;
        var legsSettings = [{
            x: 25,
            y: 32
        }, {
            x: 15,
            y: 32
        }, {
            x: 0,
            y: 32
        }, {
            x: -10,
            y: 32
        }];
        var leg, tw;
        this.legs = [];
        this.legTweens = [];
        for (var i in legsSettings) {
            tw = new Interpolation({
                object: legsSettings[i],
                property: "rotationRatio",
                from: -1,
                to: 1,
                duration: Math.random() * .3 + .5,
                onFinish: function() {
                    this.invert()
                }
            });
            legsSettings[i].rotationRatio = 0;
            this.legs.push(legsSettings[i]);
            this.legTweens.push(tw)
        }
        this.legAmplitude = 0;
        this.image = new DisplayableImage;
        this.image.image = R.sprite.alpaca;
        this.image.anchorX = -this.image.image.width / 2;
        this.image.anchorY = -this.image.image.height / 2;
        this.addChild(this.image);
        this.isDead = false;
        this.rotationAcc = 0;
        this.rotationWay = 0;
        this.flipTimer = 0;
        this.totalDistance = 0
    }
    Character.prototype = extendPrototype(DisplayableContainer, {
        render: function(c) {
            DisplayableContainer.prototype.render.call(this, c);
            var l;
            c.lineWidth = 6;
            c.strokeStyle = "#ffffff";
            c.beginPath();
            for (var i in this.legs) {
                l = this.legs[i];
                c.moveTo(l.x, l.y);
                c.lineTo(l.x + ~~(Math.cos(l.rotationRatio * this.legAmplitude + Math.PI / 2) * 30), l.y + ~~(Math.sin(l.rotationRatio * this.legAmplitude + Math.PI / 2) * 30))
            }
            c.stroke()
        },
        setPosition: function(x, y, automatic) {
            if (!this.isDead && (x !== this.x || y !== this.y) && !this.screen.paused) {
                var a = Math.atan2(y - this.y, x - this.x);
                this.targetAngle = a;
                var distance = Util.distance(this.x, this.y, x, y);
                if (!automatic) {
                    this.totalDistance += distance
                }
                this.x = Util.limit(x, 0, P.width);
                this.y = Util.limit(y, 0, P.height);
                var normalizeAngle = function(a) {
                    while (a < -Math.PI) a += Math.PI * 2;
                    while (a > Math.PI) a -= Math.PI * 2;
                    return a
                };
                var diff = normalizeAngle(this.targetAngle - this.rotation);
                var rotationMax = Math.PI * 2 * distance / 300;
                diff = Util.limit(diff, -rotationMax, rotationMax);
                this.rotation += diff;
                var diffSign = Util.sign(diff);
                if (diffSign !== this.rotationWay) {
                    this.rotationAcc = 0;
                    this.rotationWay = diffSign;
                    this.flipTimer = 1
                } else {
                    this.rotationAcc += diff
                }
                if (!automatic) {
                    this.legAmplitude = Math.PI / 2
                }
            }
        },
        cycle: function(e) {
            var rSpeed = Math.PI * 2,
                l;
            for (var i in this.legTweens) {
                this.legTweens[i].cycle(e)
            }
            this.legAmplitude = Math.max(Math.PI / 16, this.legAmplitude - e * Math.PI / 12);
            this.flipTimer -= e;
            if (this.flipTimer <= 0) {
                this.rotationAcc = 0
            } else if (this.rotationAcc > Math.PI * 2) {
                this.screen.performedFrontFlip();
                this.rotationAcc = 0
            } else if (this.rotationAcc <= -Math.PI * 2) {
                this.screen.performedBackFlip();
                this.rotationAcc = 0
            }
        },
        deathAnimation: function(trajectory) {
            if (!this.isDead) {
                this.isDead = true;
                this.nextBubble = 0;
                trajectory = trajectory || {
                    angle: Math.PI / 2,
                    speed: P.height / 6,
                    rotationSpeed: Math.PI * 3 / 6
                };
                var d = 6;
                var endX = this.x + Math.cos(trajectory.angle) * trajectory.speed * d;
                var endY = this.y + Math.sin(trajectory.angle) * trajectory.speed * d;
                var endRotation = this.rotation + trajectory.rotationSpeed * d;
                TweenPool.add(new Tween(this, "x", this.x, endX, d));
                TweenPool.add(new Tween(this, "y", this.y, endY, d));
                TweenPool.add(new Tween(this, "rotation", this.rotation, endRotation, 6));
                this.legTweens = [];
                this.image.image = R.sprite.alpaca_dead
            }
        },
        pickup: function(item) {
            this.screen.removeCyclable(item);
            this.screen.earned(P.pointsPerItem)
        },
        enableHalo: function() {
            this.halo.visible = !this.isDead
        },
        disableHalo: function() {
            this.halo.visible = false
        }
    });

    function CollisionRectangle() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0
    }
    CollisionRectangle.prototype = {
        intersect: function(a, b) {
            var polygons = [a, b];
            var minA, maxA, projected, i, i1, j, minB, maxB;
            for (i = 0; i < polygons.length; i++) {
                var polygon = polygons[i];
                for (i1 = 0; i1 < polygon.length; i1++) {
                    var i2 = (i1 + 1) % polygon.length;
                    var p1 = polygon[i1];
                    var p2 = polygon[i2];
                    var normal = {
                        x: p2.y - p1.y,
                        y: p1.x - p2.x
                    };
                    minA = maxA = undefined;
                    for (j = 0; j < a.length; j++) {
                        projected = normal.x * a[j].x + normal.y * a[j].y;
                        if (minA === undefined || projected < minA) {
                            minA = projected
                        }
                        if (maxA === undefined || projected > maxA) {
                            maxA = projected
                        }
                    }
                    minB = maxB = undefined;
                    for (j = 0; j < b.length; j++) {
                        projected = normal.x * b[j].x + normal.y * b[j].y;
                        if (minB === undefined || projected < minB) {
                            minB = projected
                        }
                        if (maxB === undefined || projected > maxB) {
                            maxB = projected
                        }
                    }
                    if (maxA < minB || maxB < minA) {
                        return false
                    }
                }
            }
            return true
        },
        getPoints: function() {
            var w_x = Math.cos(this.rotation) * this.width;
            var w_y = Math.sin(this.rotation) * this.width;
            var h_x = Math.cos(this.rotation + Math.PI / 2) * this.height;
            var h_y = Math.sin(this.rotation + Math.PI / 2) * this.height;
            var points = [];
            points.push(new CollisionPoint(this.x + h_x, this.y + h_y));
            points.push(new CollisionPoint(this.x + w_x + h_x, this.y + w_y + h_y));
            points.push(new CollisionPoint(this.x + w_x, this.y + w_y));
            points.push(new CollisionPoint(this.x, this.y));
            return points
        },
        containsPoint: function(p) {
            var ps = this.getPoints();
            var minX = ps[0].x;
            var minY = ps[0].y;
            var maxX = ps[0].x;
            var maxY = ps[0].y;
            var sides = [];
            for (var i = 1; i < ps.length; i++) {
                minX = Math.min(minX, ps[i].x);
                minY = Math.min(minY, ps[i].y);
                maxX = Math.max(maxX, ps[i].x);
                maxY = Math.max(maxY, ps[i].y);
                sides.push([ps[i - 1], ps[i]])
            }
            sides.push([ps[ps.length - 1], ps[0]]);
            if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
                return false
            }
            var areIntersecting = function(v1x1, v1y1, v1x2, v1y2, v2x1, v2y1, v2x2, v2y2) {
                var d1, d2;
                var a1, a2, b1, b2, c1, c2;
                a1 = v1y2 - v1y1;
                b1 = v1x1 - v1x2;
                c1 = v1x2 * v1y1 - v1x1 * v1y2;
                d1 = a1 * v2x1 + b1 * v2y1 + c1;
                d2 = a1 * v2x2 + b1 * v2y2 + c1;
                if (d1 > 0 && d2 > 0) return false;
                if (d1 < 0 && d2 < 0) return false;
                a2 = v2y2 - v2y1;
                b2 = v2x1 - v2x2;
                c2 = v2x2 * v2y1 - v2x1 * v2y2;
                d1 = a2 * v1x1 + b2 * v1y1 + c2;
                d2 = a2 * v1x2 + b2 * v1y2 + c2;
                if (d1 > 0 && d2 > 0) return false;
                if (d1 < 0 && d2 < 0) return false;
                if (a1 * b2 - a2 * b1 == 0) return false;
                return true
            };
            var epsilon = (maxX - minX) / 100;
            var ray = [p, new CollisionPoint(minX - epsilon, p.y)];
            var intersections = 0;
            for (var i = 0; i < sides.length; i++) {
                if (areIntersecting(sides[i][0].x, sides[i][0].y, sides[i][1].x, sides[i][1].y, ray[0].x, ray[0].y, ray[1].x, ray[1].y)) {
                    intersections++
                }
            }
            if ((intersections & 1) == 1) {
                return true
            } else {
                return false
            }
        },
        collidesWith: function(rect2) {
            var projected, val;
            var pts1 = this.getPoints();
            var pts2 = rect2.getPoints();
            return this.intersect(pts1, pts2)
        }
    };

    function CollisionPoint(x, y) {
        this.x = x;
        this.y = y
    }

    function FallingBlock(screen, settings) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.x = settings.x || 0;
        this.image = settings.image || null;
        this.width = settings.width || 0;
        this.height = settings.height || 0;
        var me = this;
        if (this.image) {
            this.view = new DisplayableImage;
            this.view.image = this.image;
            this.view.anchorX = -this.view.image.width / 2;
            this.view.anchorY = -this.view.image.height / 2;
            this.addChild(this.view)
        } else {
            this.addChild(new DisplayableShape(function(c) {
                c.fillStyle = "#ffffff";
                c.fillRect(-me.width / 2, -me.height / 2, me.width, me.height)
            }))
        }
        var d = Util.rand(3, 8);
        this.y = -200;
        var speed = (P.height + 200) / d;
        var rotationSpeed = Util.rand(-2 * Math.PI, 2 * Math.PI) / d;
        this.throwTo(Math.PI / 2, speed, rotationSpeed)
    }
    FallingBlock.prototype = extendPrototype(DisplayableContainer, {
        type: "obstacle",
        cycle: function(e) {
            this.x += e * this.vX;
            this.y += e * this.vY;
            this.rotation += e * this.rotationSpeed;
            var r = this.getRectangle();
            if (r.containsPoint(this.screen.character)) {
                this.alpha = 1;
                this.screen.gameOver("obstacle")
            } else if (this.x < -100 || this.x > P.width + 100 || this.y > P.height + 100 || this.y < -400) {
                this.screen.removeCyclable(this)
            }
        },
        getRectangle: function() {
            var r = new CollisionRectangle;
            r.width = this.width;
            r.height = this.height;
            r.color = "green";
            r.x = this.x - Math.cos(this.rotation) * this.width / 2 + Math.sin(this.rotation) * this.height / 2;
            r.y = this.y - Math.cos(this.rotation) * this.height / 2 - Math.sin(this.rotation) * this.width / 2;
            r.rotation = this.rotation;
            return r
        },
        destroy: function() {
            this.screen.removeCyclable(this)
        },
        throwTo: function(angle, speed, rotationSpeed) {
            this.vX = Math.cos(angle) * speed;
            this.vY = Math.sin(angle) * speed;
            this.rotationSpeed = rotationSpeed
        }
    });

    function Item(screen, settings) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.x = settings.x || 0;
        this.y = -100;
        this.duration = settings.duration || 1;
        this.radius = 50;
        var me = this;
        this.image = new DisplayableImage;
        this.image.image = R.sprite.lettuce;
        this.image.anchorX = -this.image.image.width / 2;
        this.image.anchorY = -this.image.image.height / 2;
        this.addChild(this.image);
        var d = Util.rand(3, 6);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Util.rand(-2 * Math.PI, 2 * Math.PI) / d;
        this.speed = (P.height + 400) / d
    }
    Item.prototype = extendPrototype(DisplayableContainer, {
        cycle: function(e) {
            this.y += e * this.speed;
            this.rotation += e * this.rotationSpeed;
            if (!this.screen.character.isDead && Util.distance(this.x, this.y, this.screen.character.x, this.screen.character.y) <= this.radius) {
                try {
                    this.screen.game.soundManager.play("item")
                } catch (e) {
                    console.log("Sound error: " + e)
                }
                this.pickupAnimation();
                this.screen.character.pickup(this);
                this.screen.pickedUpItem()
            } else if (this.y > P.height + 100) {
                this.screen.removeCyclable(this)
            }
        },
        pickupAnimation: function() {
            var sh = new DisplayableShape(function(c) {
                c.fillStyle = c.strokeStyle = "#ffffff";
                c.beginPath();
                c.arc(0, 0, this.radius, 0, Math.PI * 2, true);
                c.fill()
            });
            sh.x = this.x;
            sh.y = this.y;
            this.parent.addChild(sh);
            TweenPool.add(new Tween(sh, "radius", 0, 100, .3));
            TweenPool.add(new Tween(sh, "alpha", 1, 0, .3, 0, function() {
                this.object.remove()
            }));
            var t = new DisplayableTextField;
            this.parent.addChild(t);
            with(t) {
                x = this.x;
                y = this.y;
                textAlign = "center";
                textBaseline = "middle";
                text = "+" + P.pointsPerItem;
                color = "#ffffff";
                shadowColor = "#000";
                shadowOffsetX = 2;
                shadowOffsetY = 2;
                font = "30pt Museo"
            }
            TweenPool.add(new Tween(t, "y", t.y, t.y - 100, .7));
            TweenPool.add(new Tween(t, "alpha", 1, 0, .7, 0, function() {
                this.object.remove()
            }))
        }
    });

    function Asteroid(screen, settings) {
        DisplayableContainer.call(this);
        this.screen = screen;
        if (settings.variation === "y") {
            this.rotation = Math.PI / 2
        }
        this["scale" + settings.variation.toUpperCase()] = Util.sign(settings.to - settings.from);
        this.view = new AnimatedView({
            frames: [{
                image: R.sprite.asteroid1,
                anchorX: -248,
                anchorY: -114,
                duration: .1
            }, {
                image: R.sprite.asteroid2,
                anchorX: -248,
                anchorY: -114,
                duration: .1
            }]
        });
        this.addChild(this.view);
        this.x = settings.variation === "y" ? settings.x : settings.from;
        this.y = settings.variation === "x" ? settings.y : settings.from;
        var v = (settings.to - settings.from) / settings.duration;
        this.vX = settings.variation === "x" ? v : 0;
        this.vY = settings.variation === "y" ? v : 0;
        this.delayLeft = settings.delay || 0;
        this.pushed = []
    }
    Asteroid.prototype = extendPrototype(DisplayableContainer, {
        cycle: function(e) {
            if (this.delayLeft > 0) {
                this.delayLeft -= e;
                if (this.delayLeft <= 0) {
                    this.view.animate()
                }
            }
            if (this.delayLeft <= 0) {
                this.x += this.vX * e;
                this.y += this.vY * e;
                if (this.x <= -400 || this.x >= P.width + 400 || this.y >= P.height + 400) {}
                var a = this.screen.arrays.obstacle,
                    d;
                for (var i in a) {
                    d = Util.distance(a[i].x, a[i].y, this.x, this.y);
                    if (d < 100 && this.pushed.indexOf(a[i]) === -1) {
                        var angle = Math.atan2(a[i].y - this.y, a[i].x - this.x);
                        a[i].throwTo(angle, 500, Util.rand(-Math.PI * 2, Math.PI * 2));
                        this.pushed.push(a[i])
                    }
                }
                var c = this.screen.character;
                if (Util.distance(this.x, this.y, c.x, c.y) < 70) {
                    this.screen.gameOver("asteroid", {
                        angle: Math.atan2(c.y - this.y, c.x - this.x),
                        speed: 500,
                        rotationSpeed: Math.PI * 2
                    })
                }
            }
        }
    });

    function BackgroundEffect() {
        DisplayableObject.call(this);
        this.trippy = false;
        this.stars = [];
        for (var i = 0; i < 10; i++) {
            this.stars.push({
                x: ~~(Math.random() * P.width),
                y: ~~(Math.random() * P.height),
                speed: Math.random() * 200 + 100
            })
        }
    }
    BackgroundEffect.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            c.fillStyle = "#ffffff";
            for (var i in this.stars) {
                c.fillRect(this.stars[i].x, ~~this.stars[i].y, 2, 2)
            }
        },
        cycle: function(e) {
            for (var i in this.stars) {
                this.stars[i].y += e * this.stars[i].speed;
                if (this.stars[i].y >= P.height) {
                    this.stars[i].x = ~~(Math.random() * P.width);
                    this.stars[i].y = 0;
                    this.stars[i].speed = ~~(Math.random() * 200 + 100)
                }
            }
        }
    });

    function PowerMeter(screen) {
        DisplayableContainer.call(this);
        this.screen = screen;
        var w = 120,
            r = 5,
            h = 20,
            me = this;
        this.addChild(new DisplayableShape(function(c) {
            c.fillStyle = "#ffffff";
            c.fillRect(-r, -r, w + 2 * r, 2 * r + h);
            c.fillStyle = me.screen.power > .4 ? "#89d700" : "#ff0000";
            c.fillRect(0, 0, w * me.screen.power, h)
        }))
    }
    PowerMeter.prototype = extendPrototype(DisplayableContainer, {});

    function Controller(screen) {
        this.screen = screen
    }
    Controller.prototype = {
        touchStart: function(x, y) {},
        touchMove: function(x, y) {},
        touchEnd: function(x, y) {},
        keyDown: function(keyCode) {},
        keyUp: function(keyCode) {},
        orientationChange: function() {}
    };

    function TouchController(screen) {
        Controller.call(this, screen);
        this.created = Date.now();
        this.pauseTo = null
    }
    TouchController.prototype = extendPrototype(Controller, {
        touchStart: function(x, y) {
            var d = Util.distance(this.screen.character.x, this.screen.character.y, x, y);
            if (d < 100) {
                clearTimeout(this.pauseTo);
                this.screen.resume();
                if (Date.now() - this.created > 1e3) this.screen.character.setPosition(x, y - 100)
            }
        },
        touchMove: function(x, y) {
            if (Date.now() - this.created > 1e3) this.screen.character.setPosition(x, y - 100)
        },
        touchEnd: function(x, y) {
            if (Util.isTouchScreen()) {
                this.pauseTo = setTimeout(this.screen.pause.bind(this.screen), 1e3)
            }
        },
        cycle: function(e) {}
    });

    function KeyboardController(screen) {
        Controller.call(this, screen);
        this.keyStates = {};
        this.speed = 200
    }
    KeyboardController.prototype = extendPrototype(Controller, {
        keyDown: function(keyCode) {
            this.keyStates[keyCode] = true
        },
        keyUp: function(keyCode) {
            this.keyStates[keyCode] = false
        },
        cycle: function(e) {
            var x = this.screen.character.x;
            var y = this.screen.character.y;
            var dirX = 0,
                dirY = 0;
            if (this.keyStates[37] || this.keyStates[65] || this.keyStates[81]) {
                dirX = -1
            } else if (this.keyStates[39] || this.keyStates[68]) {
                dirX = 1
            }
            if (this.keyStates[38] || this.keyStates[90] || this.keyStates[87]) {
                dirY = -1
            } else if (this.keyStates[40] || this.keyStates[83]) {
                dirY = 1
            }
            x += this.speed * dirX * e;
            y += this.speed * dirY * e;
            this.screen.character.setPosition(x, y)
        }
    });

    function HybridController(screen) {
        Controller.call(this, screen);
        this.keyboard = new KeyboardController(screen);
        this.touch = new TouchController(screen)
    }
    HybridController.prototype = extendPrototype(Controller, {
        keyDown: function(k) {
            this.keyboard.keyDown(k)
        },
        keyUp: function(k) {
            this.keyboard.keyUp(k)
        },
        touchStart: function(x, y) {
            this.touch.touchStart(x, y)
        },
        touchEnd: function(x, y) {
            this.touch.touchEnd(x, y)
        },
        touchMove: function(x, y) {
            this.touch.touchMove(x, y)
        },
        cycle: function(e) {
            this.keyboard.cycle(e);
            this.touch.cycle(e)
        }
    })
})();