//// # ibPlayer// // since: 2013.03.24// version: 0.2.0 last update 20130601//;(function (window, $, undefined) {	// 상수의 정의	var _def = {		"engine": {			"auto": 0,			"html5": 1,			"flash": 2,			"gom": 3		}	};		// 공용 function의 정의	var _fn = {		// 두 개의 Object를 하나에 합칩니다.		"mergeProp": function (src, dest) {			if (src === undefined) {				return dest;			}			if (dest === undefined) {				dest = {};			}			for (var key in src) {				if (!src.hasOwnProperty(key)) {					continue;				}				if (src[key] === undefined) {					continue;				} else if (src[key].constructor == Object) {					_mergeProp(src[key], dest[key]);				} else {					dest[key] = src[key];				}			}			return dest;		},		"extend": function (src, property) {			// Prefix "__" 는 super member임을 나타냅니다. 			for (var key in src) {				if (!src.hasOwnProperty(key)) {					continue;				}				if (typeof property[key] !== "undefined") {					property["__" + key] = src[key];					continue;				}				if (typeof src[key] === "object") {					_mergeProp(src[key], property[key]);				} else {					property[key] = src[key];					property["__" + key] = src[key];				}			}			return property;		},		"isTouchDevice": function () {			try {				document.createEvent("TouchEvent");				return true;			} catch (e) {				return false;			}			//return ('ontouchstart' in window) // works on most browsers 		    //  || !('onmsgesturechange' in window); // works on ie10		}	};	// gomp engine	var _gom = function () {			};	_gom.prototype = {		"name": "gom",		"resize": function () {		}	};		// flash engine	var _flash = function (args) {		var _this = this;				this.args = args;		this.ele = {			"$target": $(this.args.target),			"$altContents": $(this.args.altContents),			"$video": {},			"video": {}		};				// flash object를 찾기 전에 함수를 호출 했을 경우 레디큐에 담아 보관 했다가,		// object를 찾으면 하나씩 실행 합니다.		this.readyQueue = [];		this.isReady = false;				// custom event list		this.events = [];				// native event		this.nativeEvents = ["timeupdate"];				// embed code		this.init();		this.setup();			return this;	};	_flash.prototype = {		"name": "flash",		"init": function () {					},		"setup": function (opt) {			var _this = this;			// create video			var flashvars = {			};			var params = {				menu: "false",				scale: "noScale",				allowFullscreen: "true",				allowScriptAccess: "always",				bgcolor: "",				wmode: "direct" // can cause issues with FP settings & webcam			};			var attributes = {				id:"ibp_engine"			};			swfobject.embedSWF(				"bin/ibplayer.swf", 				this.ele.$altContents.attr("id"), "100%", "100%", "10.0.0", 				"http://img.gomtv.com/js_utf8/swfobject/expressInstall.swf", 				flashvars, params, attributes, function (e) {					if (e.success) {						try {							if (e.ref) {								console.log(e.ref);								_this.isReady = true;								_this.ele.$video = $(e.ref);								_this.ele.video = e.ref;								_this.fireEvent("ready", []);							} else {								throw "not found object";							}						} catch (e) {							setTimeout(function () {								_this.ele.$video = $(_this.ele.$target.find("#ibp_engine"));								if (_this.ele.$video.length > 0) {									_this.isReady = true;									_this.ele.video = _this.ele.$video.get(0);									_this.fireEvent("ready", []);								} else {									_this.isReady = false;									alert("일시적인 오류로 인해 플래시 플레이어를 찾지 못 했습니다. 새로고침(F5) 바랍니다.");								}							}, 300);						}					}				}			);						this.addEvent("ready", function () {				_this.fireReadyQueue();			})						return this;		},		"addReadyQueue": function (callback) {			if (this.isReady) {				return;			}			this.readyQueue.push(callback);		},		"fireReadyQueue": function () {			if (!this.isReady) {				return;			}			for (var i = 0, len = this.readyQueue.length; i < len; i++) {				if ($.isFunction(this.readyQueue[i])) {					this.readyQueue[i].apply(this, []);				}			}		},		"duration": function () {			var _this = this;			try {				return this.ele.video.duration();			} catch (e) {				return 0;			}		},		"currentTime": function (seconds) {			var _this = this;			try {				if (seconds === undefined) {					return this.ele.video.currentTime();				} else {					var t = this.ele.video.currentTime(seconds);					this.fireEvent("timeupdate");					return t;				}			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.currentTime(seconds);				});			}		},		"play": function () {			var _this = this;			try {				this.ele.video.play();				this.fireEvent("play");			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.play();				});			}		},		"pause": function () {			var _this = this;			try {				this.ele.video.pause();				this.fireEvent("pause");			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.pause();				});			}		},		"paused": function () {			try {				return this.ele.video.paused();			} catch (e) {				return false;			}					},		"stop": function () {			var _this = this;			try {				this.ele.video.stop();			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.stop();				});			}		},		"volume": function (ratio) {			var _this = this;			try {				if (ratio === undefined) {					return this.ele.video.volume();				} else {					var vol = this.ele.video.volume(ratio);					this.fireEvent("volumechange");					return vol; 				}			} catch (ignore) {				this.addReadyQueue(function () {					_this.ele.video.volume(ratio);				});				return 0;			}		},		"mute": function () {			var _this = this;			try {				this.ele.video.mute();				this.fireEvent("mute");			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.mute();				});			}		},		"unmute": function () {			var _this = this;			try {				this.ele.video.unmute();				this.fireEvent("unmute");			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.unmute();				});			}		},		"muted": function () {			try {				return this.ele.video.muted();			} catch (e) {				return false;			}		},		"load": function (info) {			var _this = this;			try {				this.ele.video.load(info);				this.fireEvent("load");			} catch (e) {				this.addReadyQueue(function () {					_this.ele.video.load(info);				});			}		},		"addEvent": function (event, callback) {			if ($.inArray(event, this.nativeEvents) == -1) {				if ($.isArray(this.events[event])) {					this.events[event].push(callback);				} else {					this.events[event] = [callback];				}			} else {				window.__ibp_as_addEvent__(event, callback);			}								},		"fireEvent": function (event, data) {			$.each(this.events[event], function (idx, callback) {				if ($.isFunction(callback)) {					callback.apply(null, [data]);				}			});		}	};		// html5 engine	var _html5 = function (args) {		var _this = this;				this.args = args;		this.ele = {			"$target": $(this.args.target),			"$video": {},			"video": {}		};				// custom event list		this.events = [];				// native event		this.nativeEvents = ["ended", "pause", "play", "progress", "timeupdate", "volumechange", "ratechange", "seeking", "seeked", "error"];				// embed code		this.init();		this.setup();			return this;	};	_html5.prototype = {		"name": "html5",		// 초기화		"init": function () {					},		// <video>를 설치합니다.		//   * opt: 기타 옵션		"setup": function (opt) {			var _this = this;					// insert <video>			this.ele.$video = $("<video/>", {				"autoplay": false,				"width": "100%",				"height": "100%",				"src": "http://183.110.11.140/play.gom?attr1=10002&contentsid=3016747&nodeid=6405948&service_flag=1&level_flag=4&vieworder=1&player=HTML5&isfree=1&userno=0&userid=&uip=221.146.25.208&preview=0&start_sec=0&end_sec=0&per=827d51611df104c32b62580fdb399dc2&mkey=0ec6447f7ffbe00be6b81e3cb1be1212&skey=381ef86800bd3fe4d1d5bce62241fa64&dummy=1367589009&price=0&bitspec=3147520&screen=0&pq=0&platform_flag=48&auth=tv.gomtv.com"			});			this.ele.video = this.ele.$video.get(0);									// 이벤트			this.ele.video.addEventListener("loadeddata", function (e) {				_this.fireEvent("ready", e);			})						return this;		},		"duration": function () {			try {				return this.ele.video.duration;			} catch (e) {				return 0;			}					},		"currentTime": function (seconds) {			try {				if (seconds === undefined) {					return this.ele.video.currentTime;				} else {					return this.ele.video.currentTime = seconds;				}			} catch (e) {				return 0;			}		},		"play": function () {			this.ele.video.play();		},		"pause": function (callback) {			this.ele.video.pause();		},		"paused": function () {			return this.ele.video.paused;		},		"stop": function () {			if ($.isFunction(this.ele.video.stop)) { // video.stop()은 표준이 아님				this.ele.video.stop();			} else {				this.ele.video.pause();				this.currentTime(0);			}		},		"volume": function (ratio) {			try {				if (ratio === undefined) {					return this.ele.video.volume;				} else {					return this.ele.video.volume = ratio;				}			} catch (e) {				return 0;			}		},		"mute": function () {			this.ele.$video.prop("muted", true);			this.fireEvent("mute");		},		"unmute": function () {			this.ele.$video.prop("muted", false);			this.fireEvent("unmute");		},		"muted": function () {			return this.ele.$video.prop("muted");		},		"load": function (info) {			if (info === undefined) {				return false;			}			this.ele.$video.attr("src", info.src);			this.ele.$video.attr("type", info.type);			if (info.codecs !== undefined) {				this.ele.$video.attr("codecs", info.codecs);			}			this.fireEvent("load");		},		"addEvent": function (event, callback) {			// html5 native 이벤트가 아닐 경우 "fireEvent"를 통해 이벤트를 호출.			if ($.inArray(event, this.nativeEvents) == -1) {				if ($.isArray(this.events[event])) {					this.events[event].push(callback);				} else {					this.events[event] = [callback];				}			} else {				this.ele.video.addEventListener(event, callback);			}		},		"fireEvent": function (event, data) {			$.each(this.events[event], function (idx, callback) {				if ($.isFunction(callback)) {					callback.apply(null, [data]);				}			});		}	};		// interface module	var _api = function (args, engine) {		var _this = this;				this.args = _fn.mergeProp(args, {			"engine": _def.engine.auto,			"autoplay": false		});				this.ele = {			"$target": $(this.args.target)		};				// 종류별 엔진 오브젝트 등록		this.engines = _fn.mergeProp(engine, {			"html5": _html5,			"flash": _flash,			"gom": _gom		});				// 전역변수 초기화		this.init();				// 현재 사용할 엔진		this.engine = this.setup();	};	_api.prototype = {		"init": function () {			this.state = "stoped"; // "playing" | "paused" | "stopped"			this.playlist = [];			this.currentIndex = 0; // 현재 재생중인 영상의 인덱스 번호		},		// 플레이어를 설치합니다.		//   * opt: 기타 옵션		"setup": function (opt) {			var _this = this;			this.ele.$target.addClass("ibplayer");						// poster image			this.ele.$poster = $("<div/>", {"class": "ibp_poster"}).append( $('<table class="ibp_postertable"><tr><td class="ibp_postertd"></td></tr></table>') );			if (this.isTouchDevice) {				//			} else {				this.ele.$poster.bind("click", function () {					_this.play();				});			}			this.ele.$target.append(this.ele.$poster);						// 엔진 설정			this.ele.$screen = $("<div/>", {"class": "ibp_screen"});			this.ele.$target.append(this.ele.$screen);			switch (this.args.engine) {			case _def.engine.auto:				break;			case _def.engine.flash:				this.ele.$screen.append( $('<div class="ibp_altContents" id="ibp_altContents"><p><a href="http://www.adobe.com/go/getflashplayer">Get Adobe Flash player</a></p></div>') );				this.args.altContents = ".ibp_altContents";				this.engine = new this.engines.flash(this.args);				break;			case _def.engine.html5:				this.engine = new this.engines.html5(this.args);				this.ele.$screen.append(this.engine.ele.video);				break;			case _def.engine.gom:				break;			}									this.engine.addEvent("ready", function () {				_this.volume(0.1);				// 자동재생				if (_this.args.autoplay) {					_this.play();									}			});			return this.engine;			},		"currentTime": function (seconds) {			return this.engine.currentTime(seconds);		},		"duration": function () {			return this.engine.duration() || 0;		},		"play": function () {			this.hidePoster();			this.engine.play();		},		"stop": function () {			this.showPoster();			this.engine.stop();		},		"toggle": function () {			if (this.engine.paused()) {				this.play();			} else {				this.pause();			}		},		"pause": function () {			this.engine.pause();		},		"paused": function () {			return this.engine.paused();		},		"volume": function (ratio) {			return this.engine.volume(ratio) || 0;		},		"mute": function () {			this.engine.mute();		},		"unmute": function () {			this.engine.unmute();		},		"muted": function () {			return this.engine.muted();		},		"toggleMute": function () {			if (this.muted()) {				this.unmute();			} else {				this.mute();			}		},		"resize": function (w, h) {			this.engine.resize(w, h);		},		"getEngine": function () {			return this.engine;		},		"enterFullscreen": function () {			var target = this.ele.$target.get(0);			this.ele.$target.addClass("ibp_fullscreen");			if ($.isFunction(target.webkitRequestFullScreen)) {				target.webkitRequestFullScreen();			} else if ($.isFunction(target.mozRequestFullScreen)) {				target.mozRequestFullScreen();            } else;            this.fireEvent("enterFullscreen");		},		"exitFullscreen": function () {			this.ele.$target.removeClass("ibp_fullscreen");			if ($.isFunction(document.webkitCancelFullScreen)) {				document.webkitCancelFullScreen();                          			} else if ($.isFunction(document.mozCancelFullScreen)) {				document.mozCancelFullScreen();             } else;            this.fireEvent("exitFullscreen"); 		},		"toggleFullscreen": function () {			if (this.isFullscreen()) {				this.exitFullscreen();			} else {				this.enterFullscreen();			}		},		"isFullscreen": function () {			return this.ele.$target.hasClass("ibp_fullscreen");		},		"addEvent": function (event, callback) {			this.engine.addEvent(event, callback);		},		"fireEvent": function (event, e) {			this.engine.fireEvent(event, e);		},		// infp: {"poster":, "title":, "src":, "type":, "codecs":, "opt":,}		// overwirte: info의 src속성이 같을 경우 새로 추가되는 info로 대체 		"add": function (info, overwrite) {			if (info === undefined) {				return;			}			if (info.type === undefined) {				info.type = "video/mp4"; // default			}			this.playlist.push(info);			return this;		},		"remove": function (idx) {			for (var i = 0, j = this.playlist.length, tmp = []; i < j; i ++) {
				if (i == idx) {					continue;				}				tmp.push(this.playlist[i]);
			};			this.playlist = tmp;			return this;		},		"clear": function () {			this.playlist = [];			this.currentIndex = 0;			return this;		},		"load": function (idx) {			this.engine.load(this.playlist[idx]);			this.setPoster(this.playlist[idx].poster);			this.currentIndex = idx;			this.fireEvent("load");			return this;		},		"next": function () {			if (this.currentIndex >= this.playlist.length) {				this.stop();				return this;			}			this.load(this.currentIndex + 1);			return this;		},		"prev": function () {			if (this.currentIndex <= 0) {				return this;			}			this.load(this.currentIndex - 1);			return this;		},		// opt: true이면 readyonly도 포함 or false		"getListCount": function (opt) {			for (var cnt = 0, i = 0, j = this.playlist.length; i < j; i ++) {				if (!opt && this.playlist[i].readyonly) {					continue;				}				cnt++;			};			return cnt;		},		"getInfo": function () {			return this.playlist[this.currentIndex];		},		"getState": function () {			return this.state;		},		"setPoster": function (url) {			this.ele.$poster.find(".ibp_postertd").html( $("<img/>", {				"class": "ibp_posterimg",				"src": url			}));		},		"showPoster": function () {			this.ele.$poster.removeClass("ibp_hide").addClass("ibp_show");		},		"hidePoster": function () {			this.ele.$poster.removeClass("ibp_show").addClass("ibp_hide");		}	};		// ui	var _ui = function (args) {		this.args = _fn.mergeProp(args, {			"engine": _def.engine.auto,			"autoplay": false		});		// 전역 엘리먼트 모음		this.ele = {};		// 비디오 엔진 컨트롤러		this.v = new _api(this.args);		// 터치 지원 여부 확인		this.isTouchDevice = _fn.isTouchDevice();				this.setup();		this.init();	};	_ui.prototype = {		"init": function () {			// 전역 엘리먼트 모음			this.ele.maxVolumeWidth = 120;			this.ele.maxTimeWidth = this.ele.$ui.find(".ibp_totime").width();			this.ele.maxListItemWidth = 145;			// 현재 조작중인 영역			this.activele = null;						this.updateVolume();			this.updateTime();		},		"setup": function () {				var _this = this;								// ui			this.ele.$ui = $(				'<div class="ibp_ui">' +					'<div class="ibp_list">' +						'<div class="ibp_listbg"></div>' +						'<div class="ibp_listcon" id="ibp_listcon">' +							'<div class="ibp_listwrap" id="ibp_listwrap" style="width:870px"><div class="ibp_listplaying">재생중</div></div>' +							'<div class="ibp_listnext btn">></div>' +							'<div class="ibp_listprev btn"><</div>' +						'</div>' +					'</div>' +	    			'<div class="ibp_top">' +	    				'<table>' +	    				'<tr>' +	    					'<td class="ibp_title"></td>' +	    					'<td class="ibp_listicon btn">재생목록</td>' +	    					'<td class="ibp_embedicon btn">퍼가기</td>' +	    					'<td class="ibp_fullicon btn">전체화면</td>' +	    				'</tr>' +	    				'</table>' +	    			'</div>' +	    			'<div class="ibp_bottom">' +	    				'<table>' +	    					'<tr>' +	    					'<td class="ibp_playicon btn">재생</td>' +	    					'<td class="ibp_seekbar btn">' +	    						'<div class="ibp_hit"></div>' +	    						'<div class="ibp_totime"><span class="ibp_masktxt">00:32:56 / 00:45:17</span></div>' +	    						'<div class="ibp_timemask">' +	    							'<div class="ibp_curtime"><span class="ibp_masktxt">00:32:56 / 00:45:17</span></div>' +	    						'</div>' +	    					'</td>' +	    					'<td class="ibp_volicon btn">쉿!</td>' +	    					'<td class="ibp_volbar btn">' +	    						'<div class="ibp_hit"></div>' +	    						'<div class="ibp_totvol ibp_volidel"><span class="ibp_masktxt">96%</span></div>' +	    						'<div class="ibp_volmask">' +	    							'<div class="ibp_curvol"><span class="ibp_masktxt">96%</span></div>' +	    						'</div>' +	    					'</td>' +	    				'</tr>' +	    				'</table>' +	    			'</div>' +	    			'<div class="ibp_loading ibp_spin" title="로딩"></div>' +	    		'</div>'			);						this.ele.$target = $(this.args.target);			this.ele.$target.append(this.ele.$ui);						this.ele.$screen = $(".ibp_screen");			this.ele.$list = $(".ibp_list");			this.ele.$doc = $(document);						// initlist			this.listScroll = new iScroll('ibp_listcon', {"vScroll":false, "hScrollbar":false, "scrollbarClass":"ibp_scrollbar"});						// action button area			this.ele.$action = $("<div/>", {"class": "ibp_action"});			this.ele.$target.append(this.ele.$action);						// add events						// 마우스 오른쪽 클릭, 셀렉트, 드레그 차단			//this.ele.$target.bind("dragstart touchstart selectstart contextmenu", function () { return false; });			this.ele.$target.bind("dragstart selectstart", function () { return false; });						// 전체화면 싱크가 맞지 않을 경우를 위해; esc 키를 누르거나 다른 api를 통해 전체화면 보기를 닫을 경우 싱크가 안 맞을수 있음			$(document).bind("webkitfullscreenchange mozfullscreenchange fullscreenchange", function (e) {				var isfull = false;				if (document.webkitIsFullScreen !== undefined) {					isfull = document.webkitIsFullScreen;                          				} else if (document.mozFullScreen !== undefined) {					isfull = document.mozFullScreen; 	            } else; 				if ( !(_this.v.isFullscreen() && isfull) ) {					_this.v.exitFullscreen();				}			});						$(window).resize( function (e) {				_this.resize();			});						this.v.addEvent("ready", function (e) {				var title = _this.v.getInfo().title;				_this.ele.$ui.find(".ibp_title").text(title);				_this.initList();					});						this.v.addEvent("timeupdate", function (e) {				_this.updateTime();			});						this.v.addEvent("play", function (e) {				_this.ele.$ui.find(".ibp_playicon").text("정지");			});						this.v.addEvent("pause", function (e) {				_this.ele.$ui.find(".ibp_playicon").text("재생");			});						this.v.addEvent("volumechange", function (e) {				_this.updateVolume();			});						this.v.addEvent("mute", function (e) {				_this.ele.$ui.find(".ibp_volicon").text("소리켬");				_this.ele.$ui.find(".ibp_curvol").addClass("ibp_muted");							});						this.v.addEvent("unmute", function (e) {				_this.ele.$ui.find(".ibp_volicon").text("쉿!");				_this.ele.$ui.find(".ibp_curvol").removeClass("ibp_muted");			});						this.v.addEvent("enterFullscreen", function (e) {				_this.ele.$ui.find(".ibp_fullicon").text("일반화면");			});						this.v.addEvent("exitFullscreen", function (e) {				_this.ele.$ui.find(".ibp_fullicon").text("전체화면");			});						// list			this.v.addEvent("clear", function (e) {				_this.initList();			});						this.v.addEvent("load", function (e) {				_this.ele.$ui.find(".ibp_listplaying").css("left", _this.ele.maxListItemWidth * _this.v.currentIndex);				_this.hideList();			});						this.v.addEvent("add", function (e) {							});						this.v.addEvent("remove", function (e) {							});						if (this.isTouchDevice) {							} else {				this.ele.$target.bind("mouseenter", function (e) {					_this.showUi();				});								this.ele.$target.bind("mouseleave", function (e) {					_this.hideUi();					_this.hideList();				});								this.ele.$ui.find(".ibp_fullicon").bind("click", function () {					_this.v.toggleFullscreen();				});								this.ele.$ui.find(".ibp_listicon").bind("click", function () {					_this.toggleList();				});								this.ele.$ui.find(".ibp_listnext").bind("mousedown", function () {					_this.listScroll.scrollTo(_this.ele.maxListItemWidth * 1, 0, 300, true);				});								this.ele.$ui.find(".ibp_listprev").bind("mousedown", function () {					_this.listScroll.scrollTo(_this.ele.maxListItemWidth * -1, 0, 300, true);				});								this.ele.$ui.find(".ibp_playicon").bind("click", function () {					_this.v.toggle();				});								this.ele.$ui.find(".ibp_volicon").bind("click", function () {					_this.v.toggleMute();				});								// seek bar				this.ele.$ui.find(".ibp_seekbar .ibp_hit").bind("mousedown", function (e) {					_this.controlTime(e.offsetX);					_this.activele = "ibp_seekbar";				}).bind("mouseover", function (e) {					_this.ele.$ui.find(".ibp_totime").addClass("ibp_seekactive");				}).bind("mouseout", function (e) {					_this.ele.$ui.find(".ibp_totime").removeClass("ibp_seekactive");				});								// volume bar				this.ele.$ui.find(".ibp_volbar .ibp_hit").bind("mousedown", function (e) {					_this.controlVolume(e.offsetX);					_this.activele = "ibp_volbar";				}).bind("mouseover", function (e) {					_this.ele.$ui.find(".ibp_totvol").addClass("ibp_volactive");				}).bind("mouseout", function (e) {					_this.ele.$ui.find(".ibp_totvol").removeClass("ibp_volactive");				});								this.ele.$target.bind("mouseup mouseout", function () {					_this.activele = null;				});								this.ele.$ui.bind("mousemove", function (e) {					switch (_this.activele) {					case "ibp_volbar":						_this.controlVolume(e.offsetX);						break;										case "ibp_seekbar":						_this.controlTime(e.offsetX);						break;										}					e.preventDefault();				});			}					},		"showUi": function () {			this.ele.$ui.find(".ibp_top").addClass("ibp_topactive");			this.ele.$ui.find(".ibp_bottom").addClass("ibp_bottomactive");		},		"hideUi": function () {			this.ele.$ui.find(".ibp_top").removeClass("ibp_topactive");			this.ele.$ui.find(".ibp_bottom").removeClass("ibp_bottomactive");		},		"parseError": function (errorcode) {			// @implement		},		"controlVolume": function (offsetX) {			var ratio = offsetX / this.ele.maxVolumeWidth;			this.v.volume(ratio);		},		"updateVolume": function () {			var current = this.v.volume(),				ratio = current * 100;			if (ratio > 99) {				ratio = 100;			} else if (ratio < 1) {				ratio = 0;			}			this.ele.$ui.find(".ibp_volmask").width(ratio + "%");			this.ele.$ui.find(".ibp_volbar .ibp_masktxt").text(Math.ceil(ratio) + "%");		},		"controlTime": function (offsetX) {			var ratio = offsetX / this.ele.maxTimeWidth;			if (ratio > 0.99) {				ratio = 1;			} else if (ratio < 0.01) {				ratio = 0;			}			this.v.currentTime(this.v.duration() * ratio);		},		"updateTime": function () {			var current = this.v.currentTime(),				totalTime = this.v.duration(),				ratio = current / totalTime * 100;			this.ele.$ui.find(".ibp_timemask").width(ratio + "%");			this.ele.$ui.find(".ibp_seekbar .ibp_masktxt").text(this.timeFormat(current) + " / " + this.timeFormat(totalTime));		},		"timeFormat": function (seconds, level) {			if (!seconds) {				seconds = 0;			}			var seconds = Math.floor(seconds),				hh = Math.floor(seconds / 60 / 60),				mm = Math.floor((seconds / 60) % 60),				ss = seconds % 60;			if (level == 1) {				return this.twoDigit(ss);			} else if (level == 2) {				return this.twoDigit(mm) + ":" + this.twoDigit(ss);			} else {				return this.twoDigit(hh) + ":" + this.twoDigit(mm) + ":" + this.twoDigit(ss);			}					},		"twoDigit": function (num) {			if (num < 10) {				return "0" + num;			} else {				return num;			} 		},				// 재생목록		"initList": function () {			var _this = this,				listwrap = $("#ibp_listwrap");			$.each(this.v.playlist, function (idx, item) {				var tmp = $('<dl class="ibp_listitem">' +								'<dd class="ibp_itemimg"><table><tr><td><img src=""/></td></tr></table></dd>' +								'<dd class="ibp_itemtit">Title</dt>' +							'</dl>');				tmp.bind("dblclick", function () {					_this.v.load(idx).play();				});				tmp.find("img").attr("src", item.poster);				tmp.find(".ibp_itemtit").text(item.title);				listwrap.append(tmp);			});						// iscroll init			listwrap.css("width", this.v.playlist.length * 145);			this.listScroll.refresh();		},		"showList": function () {			this.ele.$screen.addClass("ibp_screenblur");			this.ele.$list.addClass("ibp_listactive");		},		"hideList": function () {			this.ele.$screen.removeClass("ibp_screenblur");			this.ele.$list.removeClass("ibp_listactive");		},		"toggleList": function () {			if (this.ele.$list.hasClass("ibp_listactive")) {				this.hideList();			} else {				this.showList();			}		},		"resize": function () {			// 탐색바 크기 조절			this.ele.maxTimeWidth = this.ele.$ui.find(".ibp_totime").width();			this.ele.$ui.find(".ibp_curtime").width(this.ele.maxTimeWidth);		}	}		/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*	*상속 예제*		_ui를 상속 받아 gomPlayer를 스킨을 변경하는 예제입니다.	상속을 통해 커스터마이징 하세요.	var _gomPlayer = function (args) {		// inherit:		var engine = {"html5": _html5, "flash": _flash};		_ui.apply(this, [args, engine]);			};	_gomPlayer.prototype = _fn.extend(_ui.prototype, {		...	});		/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/	// 데모 - http://video-js.zencoder.com/oceans-clip.mp4	// 무릎팍도사 15회 프리뷰- "http://183.110.13.44/play.gom?attr1=10001&contentsid=62214&nodeid=6116855&s…price=700&bitspec=2097924&screen=2&pq=0&platform_flag=48&auth=tv.gomtv.com"	// 걸스대이 기대해 - http://183.110.13.46/play.gom?attr1=10002&contentsid=583570&nodeid=6210683&service_flag=1&level_flag=4&vieworder=1&player=HTML5&isfree=1&userno=0&userid=&uip=221.146.25.208&preview=0&start_sec=0&end_sec=0&per=4044cd329959832377ffb0b89350b22e&mkey=b93bb953ed4f8f3a02ec167c6ecfc468&skey=857dfb7b495b237d0966d47511ae15fa&dummy=1364033954&price=0&bitspec=10487040&screen=2&pq=0&platform_flag=48&auth=tv.gomtv.com  	// 걸스대이 한번만 안아줘 - http://183.110.13.46/play.gom?attr1=10002&contentsid=494588&nodeid=6210683&service_flag=1&level_flag=4&vieworder=1&player=HTML5&isfree=1&userno=0&userid=&uip=221.146.25.208&preview=0&start_sec=0&end_sec=0&per=4044cd329959832377ffb0b89350b22e&mkey=b93bb953ed4f8f3a02ec167c6ecfc468&skey=857dfb7b495b237d0966d47511ae15fa&dummy=1364033954&price=0&bitspec=10487040&screen=2&pq=0&platform_flag=48&auth=tv.gomtv.com	// 싸이 젠틀맨  FullHD - http://183.110.13.46/play.gom?attr1=10002&contentsid=3014717&nodeid=6322006&service_flag=1&level_flag=4096&vieworder=1&player=HTML5&isfree=1&userno=0&userid=&uip=221.146.25.208&preview=0&start_sec=0&end_sec=0&per=4044cd329959832377ffb0b89350b22e&mkey=b93bb953ed4f8f3a02ec167c6ecfc468&skey=857dfb7b495b237d0966d47511ae15fa&dummy=1364033954&price=0&bitspec=10487040&screen=2&pq=0&platform_flag=48&auth=tv.gomtv.com  	// 시크릿 유후 - http://183.110.13.165/play.gom?attr1=10002&contentsid=3016747&nodeid=6405948&service_flag=1&level_flag=4&vieworder=1&player=HTML5&isfree=1&userno=0&userid=&uip=221.146.25.208&preview=0&start_sec=0&end_sec=0&per=827d51611df104c32b62580fdb399dc2&mkey=0ec6447f7ffbe00be6b81e3cb1be1212&skey=381ef86800bd3fe4d1d5bce62241fa64&dummy=1367589009&price=0&bitspec=3147520&screen=0&pq=0&platform_flag=48&auth=tv.gomtv.com	// poster="http://chi.gomtv.com/cgi-bin/imgview.cgi?nid=6278295&type=0"				// 외부에서 객체 인스턴스를 참조 할 수 있도록 전역 변수에 할당	window.ibp = _ui;	window.ibp.html5 = _html5;	window.ibp.flash = _flash;	window.ibp.def = _def;	window.ibp.fn = _fn;	window.ibp.api = _api;		// flash native event handler	window.__ibp_jsEvents = []; 	window.__ibp_as_addEvent__ = function (event, callback) {		var events = window.__ibp_jsEvents;		if (typeof events[event] === "object") {			events[event].push(callback);		} else {			events[event] = [callback];		}	};	window.__ibp_as_fireEvent__ = function (event, data) {		var events = window.__ibp_jsEvents[event];		for (var i = 0, len = events.length; i < len; i++) {			if (typeof events[i] === "function") {				events[i].apply(null, [data]);			}		}	};		}(window, jQuery));