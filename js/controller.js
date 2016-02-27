var module = angular.module('Main', ['ngRoute', 'yasha'])
module.controller('index', function($scope, $http) {
	$scope.to = function(href) {
		location.href = "#/" + href; 
	}
	$scope.user = {}
	$http.get(API + '/user/current').success(function(res) {
		$scope.user = res.data
	})
	$http.get(API + '/company/list').success(function(res) {
		$scope.company = [{
			name: '-- 请选择您所属公司 --',
			id: 0
		}].concat(res.data)
	})
	$scope.C = function(id) {
		if ($scope.company)
			for (var i = $scope.company.length - 1; i >= 0; i--)
				if ($scope.company[i].id == id) return $scope.company[i];
	}
})
module.controller('main', function($scope, $http) {
	mui('.mui-scroll-wrapper').scroll();
	$http.get(API + '/service/list').success(function(res) {
		if (res.code == 0) $scope.data = res.data
		else mui.toast(res.message)
	})
	$scope.filter = function(o){
		return o.status==1&&$scope.user&&($scope.user.type>0||o.type!=2)
	}
})
module.controller('service', function($scope, $http, $routeParams) {
	mui('.mui-scroll-wrapper').scroll();
	$http.get(API + '/service/' + $routeParams.id).success(function(res) {
		if (res.code == 0) {
			$scope.s = res.data
			if($scope.s.type==2){
				$scope.order.type="1"
			}else{
				$scope.order.type="0"
			}
		} else mui.toast(res.message)
	})
	var orderable = true;
	$scope.check = function() {
		var user = $scope.user;
		return !(user&&/^\d{11}$/.test(user.telphone) && user.name && orderable &&$scope.num) // && $scope.s.exist<1)
	}
	$scope.order = {}
	$scope.order.sid = $routeParams.id;
	$scope.Order = function() {
		if($scope.num<1){
			mui.toast('数量应该大于1');
			return;
		}
		$scope.order.uid = $scope.user.id;
		$scope.order.telphone = $scope.user.telphone;
		$scope.order.name = $scope.user.name;
		$scope.order.cid = $scope.user.cid;
		$scope.order.remark = $scope.user.remark;
		$scope.order.num = $scope.num;
		$scope.order.cscore = $scope.num*$scope.s.cscore;
		$scope.order.uscore = $scope.num*$scope.s.uscore;
		orderable = false
		$http.post(API + '/order/service', $scope.order).success(function(res) {
			if (res.code == 0) {
				mui.toast('预定成功')
			} else {
				orderable = true
				mui.toast(res.message)
			}
		}).error(function() {
			orderable = true
		})
	}
})
module.controller('order', function($scope, $http) {
	mui('.mui-scroll-wrapper').scroll();
	$http.get(API + '/order/current').success(function(res) {
		if (res.code == 0) $scope.data = res.data
		else mui.toast(res.message)
	})
	var a = ["已经结算", "等待接单", "已接单", "等待付款","已经取消"]
	$scope.ST = function(i) {
		return a[i];
	}
	$scope.P = function(i){
		if(i.type==0){
			return i.num+i.unit+" 共"+i.amount+"元"
		}else if(i.type==1){
			return i.num+i.unit+" 共"+(i.score?i.score+"个人积分":'')+(i.amount?i.amount+"元":'')
		}else if(i.type==2){
			return i.num+i.unit+" 共"+(i.score?i.score+"公司积分":'')+(i.amount?i.amount+"元":'')
		}
	}
	$scope.statusFilter = function(o) {
		return $scope.st == 1 && o.status == 0 || $scope.st == 0 && o.status > 0
	}
	$scope.delete = function(o){
		if(o.status!=1)mui.toast('当前状态不能取消，请联系管理员')
		else {
			$http.get(API+'/order/cancel/'+o.id).success(function(res){
				if(res.code==0){
					angular.forEach($scope.data,function(v,i){
						if(v.id==o.id)$scope.data.splice(i,1)
					})
				}else mui.toast('取消失败')
			}).error(function(){
				mui.toast('取消失败:无网络')
			})
		}
	}
})
module.controller('rank', function($scope, $http) {
	mui('.mui-scroll-wrapper').scroll();
	$http.get(API + '/score/rank').success(function(res) {
		if (res.code == 0) $scope.data = res.data
		else mui.toast(res.message)
	})
	$scope.filter = function(o){
		if(typeof o.score=="string")o.score = parseInt(o.score)
		return true
	}
})