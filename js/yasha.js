var $_GET = (function() {
	var url = window.document.location.href.toString();
	var u = url.split("?");
	if (typeof(u[1]) == "string") {
		u = u[1].split("&");
		var get = {};
		for (var i in u) {
			var j = u[i].split("=");
			get[j[0]] = decodeURIComponent(j[1]);
		}
		return get;
	} else {
		return {};
	}
})();
API = "http://ya1255.sinaapp.com/api.php";
(function() {
	var yasha = angular.module('yasha', [])
	angular.forEach('tap slide longtap scrollbottom onchange hover'.split(' '), function(eventName) {
		var directiveName = ('ng-' + eventName).replace(/([\:\-\_]+(.))/g, function(_, separator, letter, offset) {
			return offset ? letter.toUpperCase() : letter;
		})
		yasha.directive(directiveName, ['$parse', function($parse) {
			return {
				restrict: 'A',
				compile: function($element, attr) {
					var fn = $parse(attr[directiveName]);
					return function(scope, element) {
						if(eventName.charAt(0)=='o'&&eventName.charAt(1)=='n')eventName=eventName.substring(2);
						element.on(eventName, function(event) {
							var callback = function() {
								fn(scope, {
									$event: event
								});
							};
							scope.$apply(callback);
						});
					};
				}
			};
		}])
	})
	yasha.directive('iPageManager', ['$compile', function($compile) {
		const delay=300;
		return {
			restrice: 'A',
			scope: true,
			controller: function($scope, $element, $attrs) {
				var ipage = {}
				ipage.page = {}
				ipage.elem = $element
				ipage.pageStack = []
				ipage.stash = {}
				ipage.last = function(){};
				ipage.popPage = function() {
					if (ipage.pageStack.length > 0) {
						var topPage = ipage.pageStack[ipage.pageStack.length - 1].page
						topPage.remove()
						ipage.pageStack.pop()
						if (ipage.pageStack.length>0) {
							var page = ipage.pageStack[ipage.pageStack.length - 1].page
							page.removeClass('yasha-page-left')
						}
					}
				}
				ipage.toBottom = function() {
					if (ipage.pageStack.length > 0) {
						var topPage = ipage.pageStack[ipage.pageStack.length - 1].page
						topPage.addClass('yasha-page-bottom')
						setTimeout(function(topPage) {
							topPage.remove()
						}, delay, topPage)
						ipage.pageStack.pop()
						if (ipage.pageStack.length>0) {
							var page = ipage.pageStack[ipage.pageStack.length - 1].page
							page.removeClass('yasha-page-left')
						}
					}
				}
				ipage.toRight = function(name, e) {
					var i = ipage.pageStack.length - 1
					if (i >= 0 && (!name || i > 0 && ipage.pageStack[i - 1].name == name)) {
						var topPage = ipage.pageStack[i].page
						topPage.addClass('yasha-page-right')
						setTimeout(function(topPage) {
							topPage.remove()
						}, delay, topPage)
						ipage.pageStack.pop()
						if (i > 0) {
							var page = ipage.pageStack[i - 1].page
							page.removeClass('yasha-page-left')
						}
					} else {
						var topPage = ipage.pageStack[i].page
						var page = $compile('<i-page src="' + name + '.html" class="yasha-page-left" style="z-index:' + (9 + ipage.pageStack.length) + '"></i-page>')($scope)
						ipage.elem.append(page)
						topPage.addClass('yasha-page-right')
						setTimeout(function(topPage) {
							topPage.remove()
						}, delay, topPage)
						ipage.pageStack[i] = {
							name: name,
							page: page,
							e: e
						}
					}
				}
				ipage.pushPage = function(name, e) {
					ipage.last = ipage.popPage
					var prevPage
					if (ipage.pageStack.length > 0) prevPage = ipage.pageStack[ipage.pageStack.length - 1].page;
					var page = $compile('<i-page src="' + name + '.html" style="z-index:' + (11 + ipage.pageStack.length) + '"></i-page>')($scope)
					ipage.elem.append(page)
					ipage.pageStack.push({
						name: name,
						page: page,
						e: e
					})
				}
				ipage.fromRight = function(name, e) {
					ipage.last = ipage.toRight
					var prevPage
					if (ipage.pageStack.length > 0) prevPage = ipage.pageStack[ipage.pageStack.length - 1].page;
					var page = $compile('<i-page src="' + name + '.html" class="yasha-page-right" style="z-index:' + (11 + ipage.pageStack.length) + '"></i-page>')($scope)
					ipage.elem.append(page)
					if (prevPage) prevPage.addClass('yasha-page-left')
					ipage.pageStack.push({
						name: name,
						page: page,
						e: e
					})
				}
				ipage.fromBottom = function(name, e) {
					ipage.last = ipage.toBottom
					var prevPage
					if (ipage.pageStack.length > 0) prevPage = ipage.pageStack[ipage.pageStack.length - 1].page;
					var page = $compile('<i-page src="' + name + '.html" class="yasha-page-bottom" style="z-index:' + (11 + ipage.pageStack.length) + '"></i-page>')($scope)
					ipage.elem.append(page)
					ipage.pageStack.push({
						name: name,
						page: page,
						e: e
					})
				}
				ipage.topPage = function() {
					var s = ipage.pageStack
					if (s.length > 0) return s[s.length - 1]
					return {}
				}
				ipage.backTo = function(name, f) {
					var size = ipage.pageStack.length
					if (size > 0) {
						var index = size - 1
						switch (typeof name){
							case "number":
								index = name
								break;
							case "string":
								for (; ipage.pageStack[index].name != name; index--);
								break;
							default:
								index = 0
								break;
						}
						if(index<size-1){
							for (var i = index + 1; i < size - 1; i++) {
								ipage.pageStack[i].page.remove()
							}
							var stack = ipage.pageStack.splice(index + 1, size - 2 - index);
							if (f) ipage[f]()
							else ipage.last()
						}
					}
				}
				if ($attrs.main) ipage.pushPage($attrs.main)
				if ($attrs.iPageManager) $scope[$attrs.iPageManager] = ipage
				$scope.ipage = ipage
			},
			compile: function(elem, attr) {
				elem.addClass("yasha-page")
			}
		}
	}])
	yasha.directive('iPage', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			templateUrl: function(e, a) {
				return 'views/' + a.src;
			},
			compile: function(elem, attr) {
				elem.addClass("yasha-page")
				setTimeout(function(elem) {
					elem.removeClass('yasha-page-bottom')
					elem.removeClass('yasha-page-right')
					elem.removeClass('yasha-page-left')
				}, 50, elem)
			}
		}
	});
	yasha.directive('iTemplate', function() {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: function(e, a) {
				return 'views/' + a.src;
			}
		}
	});
	yasha.directive('iPageAim', function() {
		return {
			restrict: 'A',
			controller: function($scope, $element) {
				$scope.ipage.elem = $element
				$element.addClass("yasha-page")
			}
		}
	})
	yasha.directive('iRowBottoms', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				'choose': '=model'
			},
			controller: function($scope, $element, $attrs) {
				$element.addClass("yasha-close-btn")
				if (!$attrs.iRowBottoms) return
				if (!$scope.choose) $scope.choose = 0
				var btns = $attrs.iRowBottoms.split(' ');
				var container = angular.element('<div></div>')
				container.css('width', 81 * btns.length + "px")
				angular.forEach(btns, function(btn, n) {
					container.append($compile('<div ng-tap="choose=' + n + '" ng-class="{\'yasha-bg-grey\':choose==' + n + '}">' + btn + '</div>')($scope))
				})
				$element.append(container)
			}
		}
	}])
	yasha.directive('errSrc', function() {
		return {
			link: function(scope, element, attrs) {
				element.bind('error', function() {
					if (attrs.src != attrs.errSrc) {
						attrs.$set('src', attrs.errSrc);
					}
				});
			}
		}
	});
	yasha.directive('iStar', function() {
		return {
			restrict: 'E',
			scope: {
				star: "="
			},
			templateUrl: 'page/istar.html',
			compile: function(elem) {
				elem.addClass('yasha-star-box')
			}
		}
	})
	yasha.directive('iProgressBar', function() {
		return {
			restrict: 'E',
			scope: {
				value: "="
			},
			replace: true,
			templateUrl: 'page/iprogressbar.html',
			link: function(scope, elem, attr) {
				scope.color = attr.color ? attr.color : '#848484';
				scope.value = scope.value ? scope.value : 0;
			}
		}
	})
	yasha.factory('istorage', function() {
		var a = {}
		a.set = function(key, o) {
			try {
				localStorage[key] = JSON.stringify(o)
			} catch (e) {
				localStorage[key] = '{}'
			}
			return o;
		}
		a.get = function(key) {
			var s = localStorage[key]
			if (!s) return {}
			try {
				var res = eval('(' + s + ')')
				if (res == null) return {}
				return res
			} catch (e) {
				return {}
			}
		}
		a.del = function(key, k) {
			var o = a.get(key)
			if (o && typeof o[k] != 'undefined') delete o[k]
			return a.set(key, o)
		}
		a.add = function(key, k, v) {
			var o = a.get(key)
			o[k] = v
			return a.set(key, o)
		}
		return a
	})
	yasha.service('icrop', function() {
		// define Selection constructor
		function Selection(x, y, w, h) {
			this.x = x; // initial positions
			this.y = y;
			this.w = w; // and size
			this.h = h;

			this.px = x; // extra variables to dragging calculations
			this.py = y;
			this.pw = w; // extra variables to dragging calculations
			this.ph = h;

			this.csize = 6; // resize cubes size
			this.csizeh = 10; // resize cubes size (on hover)

			this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
			this.bDrag = [false, false, false, false]; // drag statuses
			this.bDragAll = false; // drag whole selection
		}

		// define Selection draw method
		Selection.prototype.draw = function() {
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.strokeRect(this.x, this.y, this.w, this.h);

				// draw part of original image
				if (this.w > 0 && this.h > 0) {
					ctx.drawImage(image, this.x * scale, this.y * scale, this.w * scale, this.h * scale, this.x, this.y, this.w, this.h);
				}

				// draw resize cubes
				ctx.fillStyle = '#fff';
				ctx.fillRect(this.x - this.iCSize[0], this.y - this.iCSize[0], this.iCSize[0] * 2, this.iCSize[0] * 2);
				ctx.fillRect(this.x + this.w - this.iCSize[1], this.y - this.iCSize[1], this.iCSize[1] * 2, this.iCSize[1] * 2);
				ctx.fillRect(this.x + this.w - this.iCSize[2], this.y + this.h - this.iCSize[2], this.iCSize[2] * 2, this.iCSize[2] * 2);
				ctx.fillRect(this.x - this.iCSize[3], this.y + this.h - this.iCSize[3], this.iCSize[3] * 2, this.iCSize[3] * 2);
			}
			// variables
		var scale;
		var canvas, ctx, parent;
		var image;
		var iMouseX, iMouseY, pMouseX, pMouseY;
		var theSelection;

		this.init = function(container) {
			if (!canvas) {
				canvas = document.createElement("canvas");
				canvas.attributes["id"] = "canvashead";
				canvas.id = "canvashead";
				canvas.style.border = "1px solid #000";
				canvas.width = container.offsetWidth;
				canvas.height = container.offsetHeight;
				ctx = canvas.getContext("2d");
				bind();
				container.appendChild(canvas);
				parent = container
			} else if (parent != container) {
				container.appendChild(canvas);
				parent = container
			}
		}
		this.setImage = function(src) {
			image = new Image();
			image.onload = function() {
				scale = image.naturalWidth / canvas.width;
				var tmp = image.naturalHeight / canvas.height;
				if (tmp > scale) {
					scale = tmp;
					canvas.width = canvas.height * image.naturalWidth / image.naturalHeight;
				} else {
					canvas.height = canvas.width * image.naturalHeight / image.naturalWidth;
				}
				var top = (canvas.parentElement.offsetHeight - canvas.height) / 2;
				canvas.style.marginTop = top + 'px';
				var w = (canvas.width < canvas.height ? canvas.width : canvas.height) / 2;
				theSelection = new Selection(0, 0, w, w);
				drawScene()
			}
			image.src = src;
		}


		function drawScene() { // main drawScene function
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

			// draw source image
			ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

			// and make it darker
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// draw selection
			theSelection.draw();
		}

		function getOffset(e) {
			if (!e || typeof e.offsetTop == "undefined") return {
				top: 0,
				left: 0
			}
			var o = getOffset(e.parentNode);
			return {
				top: e.offsetTop + o.top,
				left: e.offsetLeft + o.left
			}
		}

		function nofixsize() {
			// in case of dragging of resize cubes
			var iFW, iFH;
			if (theSelection.bDrag[0]) {
				var iFX = iMouseX - theSelection.px;
				var iFY = iMouseY - theSelection.py;
				iFW = theSelection.w + theSelection.x - iFX;
				iFH = theSelection.h + theSelection.y - iFY;
			}
			if (theSelection.bDrag[1]) {
				var iFX = theSelection.x;
				var iFY = iMouseY - theSelection.py;
				iFW = iMouseX - theSelection.px - iFX;
				iFH = theSelection.h + theSelection.y - iFY;
			}
			if (theSelection.bDrag[2]) {
				var iFX = theSelection.x;
				var iFY = theSelection.y;
				iFW = iMouseX - theSelection.px - iFX;
				iFH = iMouseY - theSelection.py - iFY;
			}
			if (theSelection.bDrag[3]) {
				var iFX = iMouseX - theSelection.px;
				var iFY = theSelection.y;
				iFW = theSelection.w + theSelection.x - iFX;
				iFH = iMouseY - theSelection.py - iFY;
			}

			if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
				theSelection.w = iFW;
				theSelection.h = iFH;

				theSelection.x = iFX;
				theSelection.y = iFY;
			}
		}

		function fixsize(fx, fy) {
			// in case of dragging of resize cubes
			var iFW, iFH;
			if (theSelection.bDrag[0]) {
				var f = (-fx - fy) / 2;
				if (theSelection.px - f < 0)
					f = theSelection.px;
				if (theSelection.py - f < 0)
					f = theSelection.py;
				var iFY = theSelection.py - f;
				var iFX = theSelection.px - f;
				iFW = theSelection.pw + f;
				iFH = theSelection.ph + f;
			}
			if (theSelection.bDrag[1]) {
				var f = (fx - fy) / 2;
				var iFX = theSelection.px;
				if (theSelection.py - f < 0)
					f = theSelection.py;
				if (theSelection.x + theSelection.pw + f > canvas.width)
					f = canvas.width - theSelection.x - theSelection.pw;
				var iFY = theSelection.py - f;
				iFW = theSelection.pw + f;
				iFH = theSelection.ph + f;
			}
			if (theSelection.bDrag[2]) {
				var f = (fx + fy) / 2;
				var iFX = theSelection.x;
				var iFY = theSelection.y;
				var x = theSelection.x + theSelection.pw + f;
				if (x > canvas.width)
					f = canvas.width - theSelection.x - theSelection.pw;
				var y = theSelection.y + theSelection.ph + f;
				if (y > canvas.height)
					f = canvas.height - theSelection.y - theSelection.ph;
				iFW = theSelection.pw + f;
				iFH = theSelection.ph + f;
			}
			if (theSelection.bDrag[3]) {
				var f = (-fx + fy) / 2;
				var iFY = theSelection.py;
				if (theSelection.px - f < 0)
					f = theSelection.px;
				if (theSelection.y + theSelection.ph + f > canvas.height)
					f = canvas.height - theSelection.y - theSelection.ph;
				var iFX = theSelection.px - f;
				iFW = theSelection.pw + f;
				iFH = theSelection.ph + f;
			}

			if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
				theSelection.w = iFW;
				theSelection.h = iFH;

				theSelection.x = iFX;
				theSelection.y = iFY;
			}
		}

		function bind() {
			canvas.addEventListener("touchmove", function(event) { // binding mouse move event
				event.preventDefault();
				var e = event.touches[0];
				var offset = getOffset(canvas);
				iMouseX = Math.floor(e.pageX - offset.left);
				iMouseY = Math.floor(e.pageY - offset.top);
				var fx = iMouseX - pMouseX;
				var fy = iMouseY - pMouseY;
				// in case of drag of whole selector
				if (theSelection.bDragAll) {
					var x = theSelection.px + fx;
					var y = theSelection.py + fy;
					if (x < 0)
						theSelection.x = 0;
					else if (x + theSelection.w > canvas.width)
						theSelection.x = canvas.width - theSelection.w;
					else
						theSelection.x = x;
					if (y < 0)
						theSelection.y = 0;
					else if (y + theSelection.h > canvas.height)
						theSelection.y = canvas.height - theSelection.h;
					else
						theSelection.y = y;
				}

				fixsize(fx, fy);
				drawScene();
			});

			canvas.addEventListener("touchstart", function(event) { // binding mousedown event
				event.preventDefault();
				var e = event.touches[0];
				var offset = getOffset(canvas);
				iMouseX = pMouseX = Math.floor(e.pageX - offset.left);
				iMouseY = pMouseY = Math.floor(e.pageY - offset.top);

				theSelection.px = theSelection.x;
				theSelection.py = theSelection.y;
				theSelection.pw = theSelection.w;
				theSelection.ph = theSelection.h;

				if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
					iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {
					theSelection.bDrag[0] = true;
					theSelection.iCSize[0] = theSelection.csizeh;
				}
				if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
					iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {
					theSelection.bDrag[1] = true;
					theSelection.iCSize[1] = theSelection.csizeh;
				}
				if (iMouseX > theSelection.x + theSelection.w - theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
					iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {
					theSelection.bDrag[2] = true;
					theSelection.iCSize[2] = theSelection.csizeh;
				}
				if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
					iMouseY > theSelection.y + theSelection.h - theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {
					theSelection.bDrag[3] = true;
					theSelection.iCSize[3] = theSelection.csizeh;
				}

				if (iMouseX > theSelection.x + theSelection.csizeh && iMouseX < theSelection.x + theSelection.w - theSelection.csizeh &&
					iMouseY > theSelection.y + theSelection.csizeh && iMouseY < theSelection.y + theSelection.h - theSelection.csizeh) {
					theSelection.bDragAll = true;
				}
			});

			canvas.addEventListener("touchend", function(e) { // binding mouseup event
				e.preventDefault();
				theSelection.bDragAll = false;

				for (i = 0; i < 4; i++) {
					theSelection.bDrag[i] = false;
					theSelection.iCSize[i] = theSelection.csize;
				}
				theSelection.px = 0;
				theSelection.py = 0;
				drawScene();
			});

			canvas.addEventListener("touchcancel", function(e) { // binding mouseup event
				console.log("touchcancel")
			});
		}

		this.getResults = function() {
			var temp_ctx, temp_canvas;
			temp_canvas = document.createElement('canvas');
			temp_ctx = temp_canvas.getContext('2d');
			temp_canvas.width = 180;
			temp_canvas.height = 180;
			temp_ctx.drawImage(image, theSelection.x * scale, theSelection.y * scale, theSelection.w * scale, theSelection.h * scale, 0, 0, 180, 180);
			return temp_canvas.toDataURL();
		}
	})
	yasha.factory('ipick', function() {
		var pick = function(type, callback) {
			var f = angular.element('<input type="file" accept="' + type + '"/>')[0];
			f.click();
			f.addEventListener('change', function(e) {
				var path = window.URL.createObjectURL(e.target.files.item(0))
				if (typeof callback == 'function') callback(path)
			})
		}
		return {
			pickFile: function(callback) {
				pick('*', callback)
			},
			pickImage: function(callback) {
				pick('image/*', callback)
			},
			pick: pick,
			toBase64:function(url, callback, outputFormat){
			    var canvas = document.createElement('CANVAS'),
			        ctx = canvas.getContext('2d'),
			        img = new Image;
			    img.crossOrigin = 'Anonymous';
			    img.onload = function(){
			        canvas.height = 67;
			        canvas.width = 90;
			        ctx.drawImage(img,0,0,90,67);
			        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
			        callback.call(this, dataURL);
			        canvas = null; 
			    };
			    img.src = url;
			}
		}
	})
	yasha.factory('inim', function() {
		var api = {}
		api.connect = function(telphone, token) {
			api.cfg.account = telphone
			api.cfg.token = token
			api.nim = new NIM(api.cfg)
			return api
		}
		api.getCfg = function($scope) {
			var Undefined = function(a, b, c) {
				console.log(JSON.stringify(a))
			}
			var pushSysMsgs = function(sysMsgs) {
				$scope.$apply(function() {
					data.sysMsgs = api.nim.mergeSysMsgs(data.sysMsgs, sysMsgs);
				})
			}
			var pushMsg = function(msg) {
				$scope.$apply(function(){
				    if (!Array.isArray(msgs)) { msgs = [msgs]; }
				    var sessionId = msgs[0].sessionId;
				    data.msgs = data.msgs || {};
				    data.msgs[sessionId] = nim.mergeMsgs(data.msgs[sessionId], msgs);
				})
			}
			var refreshFriendsUI = Undefined;
			var refreshSysMsgsUI = Undefined;
			var status = {}
			var data = {}
			api.status = status
			api.data = data
			api.cfg = {
				appKey: '27cd065020ccee806fcbe19fd0f167e5',
				onconnect: function() {
					status.connect = {
						msg: "连接成功",
						online: true,
						obj: {}
					}
					console.log("连接成功");
				},
				onerror: function(error) {
					status.connect = {
						msg: "断开连接",
						online: false,
						obj: error
					}
					console.log(error);
				},
				onwillreconnect: function(obj) {
					status.connect = {
						msg: "正在重连",
						online: false,
						obj: obj
					};
					// 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
					console.log('即将重连');
				},
				ondisconnect: function(error) {
					status.connect = {
						msg: "丢失连接",
						online: false,
						obj: error
					};
					// 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
					console.log('丢失连接');
				},
				// 多端登陆
				onloginportschange: Undefined,
				// 用户关系
				onblacklist: Undefined,
				onsyncmarkinblacklist: Undefined,
				onmutelist: Undefined,
				onsyncmarkinmutelist: Undefined,
				// 好友关系
				onfriends: function(friends) {
					console.log('收到好友列表', friends);
					data.friends = nim.mergeFriends(data.friends, friends);
					data.friends = nim.cutFriends(data.friends, friends.invalid);
					refreshFriendsUI();
				},
				onsyncfriendaction: Undefined,
				// 用户名片
				onmyinfo: function(obj) {
					status.account = obj
				},
				onupdatemyinfo: Undefined,
				onusers: Undefined,
				onupdateuser: Undefined,
				// 群组
				onteams: Undefined,
				onsynccreateteam: Undefined,
				onteammembers: Undefined,
				onsyncteammembersdone: Undefined,
				onupdateteammember: Undefined,
				// 会话
				onsessions: function(sessions) {
					console.log('收到会话列表', sessions);
					data.sessions = api.nim.mergeSessions(data.sessions, sessions);
				},
				onupdatesession: function(session) {
					console.log('会话更新了', session);
					data.sessions = nim.mergeSessions(data.sessions, session);
				},
				// 消息
				onroamingmsgs: function(obj) {
					console.log('收到漫游消息', obj);
				},
				onofflinemsgs: function(obj) {
					console.log('收到离线消息', obj);
				},
				onmsg: function(obj) {
					console.log('收到消息', obj);
				},
				// 系统通知
				onofflinesysmsgs: function(msg) {
					console.log('收到离线系统通知', msg);
					pushSysMsgs(msg);
				},
				onsysmsg: function(msg) {
					console.log('收到系统通知', msg);
					pushSysMsgs(msg);
				},
				onupdatesysmsg: function(sysMsg) {
					pushSysMsgs(sysMsg);
				},
				onsysmsgunread: function(obj) {
					console.log('收到系统通知未读数', obj);
					data.sysMsgUnread = obj;
					refreshSysMsgsUI();
				},
				onupdatesysmsgunread: function(obj) {
					console.log('系统通知未读数更新了', obj);
					data.sysMsgUnread = obj;
					refreshSysMsgsUI();
				},
				onofflinecustomsysmsgs: Undefined,
				oncustomsysmsg: Undefined,
				// 同步完成
				onsyncdone: Undefined,
				// 数据源
				dataSource: {
					getUser: function(account) {
						return api.nim.findUser(data.users, account);
					},
					getSession: function(sessionId) {
						return api.nim.findSession(data.sessions, sessionId);
					},
					getMsg: function(msg) {
						return api.nim.findMsg(data.msgs && data.msgs[msg.sessionId], msg.idClient);
					},
					getSysMsg: function(sysMsg) {
						return api.nim.findSysMsg(data.sysMsgs, sysMsg.idServer);
					}
				}
			};
			return api.cfg;
		};
		return api;
	});
	yasha.factory('authInterceptor', function($rootScope, $q, istorage) {
		return {
			request: function(config) {
				config.headers = config.headers || {};
				var user = istorage.get('user')
				if (user.token) {
					config.headers.Yasha = user.token;
				}
				return config;
			},
			response: function(response) {
				if (response.status === 401) {
					// handle the case where the user is not authenticated
				}
				return response || $q.when(response);
			}
		};
	});
	yasha.config(function($httpProvider) {
		$httpProvider.interceptors.push('authInterceptor');
	});
	yasha.filter('to_trusted', ['$sce', function($sce) {
		return function(text) {
			if(typeof text=="string")return $sce.trustAsHtml(text);
			return $sce.trustAsHtml(""+text)
		};
	}])
	yasha.directive("iPicker",['ipick',function(ipick){
		return {
			restrict:'A',
			scope:{
				'src':'=model'
			},
			link:function(s,e,a){
				e.on('click',function(ev){
					ipick.pickImage(function(path){
						ev.target.src = path
						ipick.toBase64(path,function(data){
							s.$apply(function(){
								s.src = data
							})
						})
					})
				})
			}
		}
	}])
})()