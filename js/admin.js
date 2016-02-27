var module = angular.module('Main', ['ngRoute', 'yasha'])
module.factory('api', function($http, ipick) {
	var api = {}
	var $scope = {}
	var table, inits;
	api.init = function(s, t, is) {
		s.v = {}
		$scope = s;
		table = t;
		switch (typeof is) {
			case "object":
				inits = function() {
					$scope.s = {}
					angular.extend($scope.s, is)
				}
				break;
			case "function":
				inits = is
				break
			default:
				inits = function() {}
		}
		inits()
		$http.get(API + '/' + table + '/list').success(function(res) {
			$scope.data = res.data
			if(table=='order'){
				angular.forEach($scope.data,function(s){
					s.st = s.status
				})
			}
		})
	}
	api.setimg = function(e, k) {
		var path = window.URL.createObjectURL(e.target.files.item(0))
		e.target.disabled = true;
		ipick.toBase64(path, function(data) {
			$scope.$apply(function() {
				$scope.s[k] = data
			})
			e.target.disabled = false;
		})
	}
	api.insert = function(e, data) {
		e.target.disabled = true;
		if (!data) data = $scope.s
		$http.post(API + '/' + table + '/add', data).success(function(res) {
			e.target.disabled = false;
			if (res.code == 0) {
				$scope.data.push(res.data);
				inits(res.data)
			} else alert(res.message);
		}).error(function() {
			e.target.disabled = false;
			alert("添加失败")
		})
	}
	api.edit = function(e, s) {
		angular.extend($scope.v, s)
		e.target.style.display = "none";
		e.target.nextElementSibling.style.display = "block";
		e.target.nextElementSibling.focus()
	}
	api.changeimg = function(e, s) {
		e.target.nextElementSibling.click();
	}
	api.save = function(e, s) {
		var c = false
		for (k in s) {
			if (!k.startsWith('$') && s[k] != $scope.v[k]) {
				c = {
					id: s.id
				}
				c[k] = $scope.v[k]
				break
			}
		}
		if (!c) {
			e.target.style.display = "none";
			e.target.previousElementSibling.style.display = "block";
			return;
		}
		e.target.disabled = true;
		$http.post(API + '/' + table + '/update', c).success(function(res) {
			e.target.disabled = false;
			if (res.code == 0) {
				angular.extend(s, res.data)
				angular.extend($scope.v, c)
			} else alert(res.message)
			e.target.style.display = "none";
			e.target.previousElementSibling.style.display = "block";
		}).error(function() {
			e.target.disabled = false;
			e.target.style.display = "none";
			e.target.previousElementSibling.style.display = "block";
			alert('修改失败')
		})
	}
	api.uploadimg = function(e, s, k) {
		var path = window.URL.createObjectURL(e.target.files.item(0))
		e.target.disabled = true;
		ipick.toBase64(path, function(data) {
			var d = {}
			d.id = s.id
			d[k] = data
			$http.post(API + '/' + table + '/update', d).success(function(res) {
				if (res.code == 0) s[k] = data
				else alert('图片上传失败');
				e.target.disabled = false;
			}).error(function() {
				alert('图片上传失败');
				e.target.disabled = false;
			})
		})
	}
	api.updatestatus = function(e, s, k) {
		e.target.disabled = true
		var d = {}
		d.id = s.id
		d[k] = s[k] != 0 ? 0 : 1
		$http.post(API + '/' + table + '/update', d).success(function(res) {
			if (res.code == 0)
				s[k] = s[k] != 0 ? 0 : 1
			else {
				alert(res.message)
			}
			e.target.disabled = false;
		}).error(function() {
			e.target.disabled = false;
			alert("修改状态失败")
		})
	}
	api.del = function(e, s) {
		if (confirm("你确定要删除" + (s.name ? s.name : "") + "?")) {
			e.target.disabled = true
			$http.post(API + '/' + table + '/del', {
				id: s.id
			}).success(function(res) {
				if (res.code == 0)
					for (var i = $scope.data.length - 1; i >= 0; i--) {
						if ($scope.data[i].id == s.id) {
							$scope.data.splice(i, 1)
							break;
						}
					} else {
						alert(res.message)
						e.target.disabled = false;
					}
			}).error(function() {
				e.target.disabled = false;
				alert("删除失败")
			})
		}
	}
	return api
})
module.controller('index', function($scope, $http) {
	$scope.to = function(href) {
		location.href = "#/" + href;
	}
})
module.controller('main', function($scope, $http, api) {
	api.init($scope, 'service', {
		cscore: 0,
		uscore: 0,
		status: 1
	})
	angular.extend($scope, api);
	$scope.uploadimg = function(e, s) {
		api.uploadimg(e, s, 'img')
	}
	$scope.updatestatus = function(e, s) {
		api.updatestatus(e, s, 'status')
	}
	$scope.checkadd = function() {
		var s = $scope.s;
		return !(/[\d\.]+/.test(s.price) && /[\d\.]+/.test(s.cscore) && /[\d\.]+/.test(s.uscore) && s.name)
	}
})
module.controller('user', function($scope, $http, api) {
	$http.get(API + '/company/list').success(function(res) {
		if (res.code == 0) $scope.company = res.data;
	})
	api.init($scope, 'user')
	angular.extend($scope, api);
	$scope.getCompanyById = function(id) {
		if ($scope.company)
			for (var i = $scope.company.length - 1; i >= 0; i--) {
				if ($scope.company[i].id == id) {
					return $scope.company[i];
				}
			}
		return {
			name: '未选择公司'
		}
	}
})
module.controller('manager', function($scope, $http, api) {
	$http.get(API + '/company/list').success(function(res) {
		if (res.code == 0) $scope.company = res.data;
	})
	$http.get(API + '/user/list').success(function(res) {
		if (res.code == 0) $scope.user = res.data;
	})
	api.init($scope, 'manager', function() {
		$scope.s = {
			cid: $scope.s ? $scope.s.cid : 0,
			token: hex_md5("" + new Date().getTime() + Math.random())
		}
	})
	angular.extend($scope, api);
	$scope.insert = function(e) {
		for (var i = 0; i < $scope.count; i++) {
			var a = {}
			angular.extend(a, $scope.s);
			a.token = hex_md5("" + new Date().getTime() + Math.random());
			api.insert(e, a);
		}
	}
	$scope.checkadd = function() {
		var s = $scope.s;
		return !(s.cid && s.token)
	}
	$scope.getCompanyById = function(id) {
		if ($scope.company)
			for (var i = $scope.company.length - 1; i >= 0; i--) {
				if ($scope.company[i].id == id) {
					return $scope.company[i];
				}
			}
		return {
			name: '错误：公司编号错误'
		}
	}
	$scope.U = function(id) {
		if ($scope.user)
			for (var i = $scope.user.length - 1; i >= 0; i--) {
				if ($scope.user[i].id == id) {
					return $scope.user[i];
				}
			}
		return {
			name: '未绑定'
		}
	}
})
module.controller('order', function($scope, $http, api) {
	$http.get(API + '/service/list').success(function(res) {
		if (res.code == 0) $scope.service = res.data;
	})
	$http.get(API + '/user/list').success(function(res) {
		if (res.code == 0) $scope.user = res.data;
	})
	api.init($scope, 'order', function() {
		$scope.s = {
			cid: $scope.s ? $scope.s.cid : 0,
			token: hex_md5("" + new Date().getTime() + Math.random())
		}
	})
	angular.extend($scope, api);
	$scope.U = function(id) {
		if ($scope.user)
			for (var i = $scope.user.length - 1; i >= 0; i--) {
				if ($scope.user[i].id == id) {
					return $scope.user[i];
				}
			}
		return {
			name: '未知ID'
		}
	}
	$scope.S = function(id) {
		if ($scope.service)
			for (var i = $scope.service.length - 1; i >= 0; i--) {
				if ($scope.service[i].id == id) {
					return $scope.service[i];
				}
			}
		return {
			name: '未知服务'
		}
	}
	var a = ["已经结算", "等待接单", "已接单", "等待付款","用户取消"]
	$scope.ST = function(i) {
		return a[i];
	}
	$scope.St = [false,true,true,true,false]
	$scope.checkSt = function(o){
		return $scope.St[o.status]
	}
	$scope.change = function(s) {
		var d = {}
		d.id = s.id
		d.status = s.st
		$http.post(API + '/order/update', d).success(function(res) {
			if (res.code == 0) {
				s.status = s.st
			} else {
				s.st = s.status
				alert('修改状态失败')
			}
		}).error(function() {
			s.st = s.status
			alert('修改状态失败')
		})
	}
})
module.controller('company', function($scope, $http, api) {
	api.init($scope, 'company', {
		score: 0
	})
	angular.extend($scope, api);
	$scope.uploadimg = function(e, s) {
		api.uploadimg(e, s, 'img')
	}
	$scope.updatestatus = function(e, s) {
		api.updatestatus(e, s, 'status')
	}
	$scope.checkadd = function() {
		var s = $scope.s;
		return !(s.name)
	}
})
module.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/main', {
			templateUrl: 'admin/main.html',
			controller: 'main'
		}).
		when('/user', {
			templateUrl: 'admin/user.html',
			controller: 'user'
		}).
		when('/company', {
			templateUrl: 'admin/company.html',
			controller: 'company'
		}).
		when('/manager', {
			templateUrl: 'admin/manager.html',
			controller: 'manager'
		}).
		when('/order', {
			templateUrl: 'admin/order.html',
			controller: 'order'
		}).
		otherwise({
			redirectTo: '/main'
		});
	}
])