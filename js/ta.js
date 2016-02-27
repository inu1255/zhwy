API = "http://ya1255.sinaapp.com/api.php";
var module = angular.module('Main', ['yasha'])
module.controller('index', function($scope, $http,$compile) {
	var options = {
		user:{
			table:'user',
			numeric:['score'],
			nodel:true,
			noadd:true,
			label:[{
				label:'headimgurl',
				name:'头像',
				value:function(o){
					return '<img src="'+o+'" class="head"/>';
				}
			},{
				label:'name',
				name:'姓名',
			},{
				label:'telphone',
				name:'电话',
			},{
				label:'nickname',
				name:'昵称',
			},{
				label:'sex',
				name:'性别',
				value:function(o){
					switch(o){
						case "0":case 0:return "未知"
						case "1":case 1:return "男"
						default:return "女"
					}
				}
			},{
				label:'cid',
				name:'公司',
				value:function(o){
					if(o<1)return "【未选择公司】"
					var d = $scope.t.company.data
					if(d)for(var i=d.length-1;i>=0;i--){
						if(d[i].id==o)return d[i].name
					}
				},
				edit:function(e){
					return '<select ng-model="e.'+this.label+'" ng-options="c.id as c.name for c in t.company.data"></select>'
				}
			},{
				label:'type',
				name:'职位',
				value:function(o){
					return ["员工","经理","微信运营"][o]
				},
				edit:["员工","经理","微信运营"]
			},{
				label:'score',
				name:'积分',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.score"/>分'
				}
			},],
		},
		company:{
			table:'company',
			numeric:['score'],
			label:[{
				name:"名称",
				label:'name',
				edit:true
			},{
				name:"地址",
				label:'address',
				edit:true
			},{
				label:'score',
				name:'积分',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.score"/>分'
				}
			},]
		},
		service:{
			table:'service',
			numeric:['cscore','uscore','price'],
			init:{
				img:'../img/codebar.png',
				type:'3',
				unit:"个",
				cscore:0,
				uscore:0,
				status:"1"
			},
			label:[{
				label:'img',
				name:'图片',
				value:function(o){
					return '<img src="'+o+'" class="head"/>';
				},
				edit:function(o){
					return '<img i-picker ng-src="{{e.img}}" model="e.img" class="head">'
				}
			},{
				name:"名称",
				label:'name',
				edit:true
			},{
				name:"介绍",
				label:'description',
				edit:'textarea',
				value:function(o){
					return '<pre>'+o+'</pre>'
				}
			},{
				name:"购买类型",
				label:'type',
				value:function(o){
					return ["未知","付款","积分","积分折现"][o]
				},
				edit:["未知","付款","积分","积分折现"]
			},{
				name:"价格",
				label:'price',
				value:function(o,s){
					return o+["元","元","积分","元(100积分抵1元)"][s.type]
				},
				edit:function(o,s){
					return '<input type="text" ng-model="e.'+this.label+'"/>{{["元","元","积分","元(100积分抵1元)"][e.type]}}'
				}
			},{
				name:"单位",
				label:'unit',
				edit:true
			},{
				label:'cscore',
				name:'公司积分',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>分'
				}
			},{
				label:'uscore',
				name:'个人积分',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>分'
				}
			},{
				label:'status',
				name:'状态',
				value:function(o){
					return o==1?"上架中":"未上架"
				},
				edit:["未上架","上架中"]
			},]
		},
		order:{
			table:'order',
			numeric:['score'],
			noadd:true,
			order:"-time",
			_st:[{
				value:false,
				label:'已经结算'
			},{
				value:true,
				label:"等待接单",
			},{
				value:true,
				label:"已接单",
			},{
				value:true,
				label:"等待付款",
			},{
				value:false,
				label:"已经取消"
			},],
			filter:function(o){
				return $scope.model.option._st[o.status].value
			},
			label:[{
				name:"姓名",
				label:'name',
			},{
				name:"服务",
				label:'sid',
				value:function(o){
					if(o<1)return "【未知服务】"
					var d = $scope.t.service.data
					if(d)for(var i=d.length-1;i>=0;i--){
						if(d[i].id==o)return d[i].name
					}
				}
			},{
				name:"使用积分",
				label:'score',
				value:function(o,s){
					return ['','个人','公司'][s.type]+o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>分'
				}
			},{
				name:"总价格",
				label:'amount',
				value:function(o){
					return o+"元"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>元'
				}
			},{
				name:"数量",
				label:'num',
				unit:function(sid){
					if(!sid||sid<1)return '个'
					var d = $scope.t.service.data
					if(d)for(var i=d.length-1;i>=0;i--){
						if(d[i].id==sid)return d[i].unit
					}
					return '个'
				},
				value:function(o,s){
					return o+this.unit(s.sid)
				},
				edit:function(o,s){
					return '<input type="text" ng-model="e.'+this.label+'"/>'+this.unit(s.sid)
				}
			},{
				name:"电话",
				label:'telphone',
			},{
				name:"备注",
				label:'remark',
				value:function(o){
					return '<pre>'+o+'</pre>'
				}
			},{
				name:'公司积分',
				label:'cscore',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>分'
				}
			},{
				name:'个人积分',
				label:'uscore',
				value:function(o){
					return o+"分"
				},
				edit:function(){
					return '<input type="text" ng-model="e.'+this.label+'"/>分'
				}
			},{
				name:'状态',
				label:'status',
				value:function(o){
					return ["已经结算", "等待接单", "已接单", "等待付款","已经取消"][o]
				},
				edit:["已经结算", "等待接单", "已接单", "等待付款","已经取消"]
			},{
				name:"时间",
				label:"time",
				value:function(o){
					var t = new Date(o)
					var now = new Date()
					var s = (now.getTime() - t.getTime())/1000
					var time = t.toTimeString().substr(0,5)
					if(s<60)return "刚刚";
					else if(s<3600)return parseInt(s/60)+"分钟前"
					else if(s<86400)return time
					else if(s<604800)return parseInt(s/86400)+"天前 "+time
					else return o.substr(0,16)
				}
			}]
		},
		manager:{
			table:'manager',
			order:"cid",
			add:[{
				label:'cid',
				name:'公司',
				edit:function(){
					return '<select ng-model="e.'+this.label+'" ng-options="c.id as c.name for c in t.company.data"></select>'
				}
			},{
				label:'num',
				name:'添加条数',
				edit:true
			}],
			init:{
				cid:"1",
				num:1
			},
			label:[{
				label:'cid',
				name:'公司',
				value:function(o){
					if(o<1)return "【未知公司】"
					var d = $scope.t.company.data
					if(d)for(var i=d.length-1;i>=0;i--){
						if(d[i].id==o)return d[i].name
					}
				},
				edit:function(){
					return '<select ng-model="e.'+this.label+'" ng-options="c.id as c.name for c in t.company.data"></select>'
				}
			},{
				name:"状态",
				label:'uid',
				value:function(o){
					if(o<1)return "【未绑定】"
					var d = $scope.t.user.data
					if(d)for(var i=d.length-1;i>=0;i--){
						if(d[i].id==o)return d[i].name||d[i].nickname
					}
				}
			},{
				name:"验证码",
				label:'token',
				edit:true
			},]
		}
	}
	$scope.models = [{// 0
		name:"用户管理",
		option:options.user,
		ex:'user'
	},{// 1
		name:"服务管理",
		option:options.service,
		ex:'service'
	},{// 2
		name:"订单管理",
		option:options.order
	},{// 3
		name:"公司管理",
		option:options.company,
		ex:'company'
	},{// 4
		name:"经理凭证",
		option:options.manager,
	}]
	$scope.t = {}
	angular.forEach($scope.models,function(m,i){
		if(m.ex)$scope.t[m.ex] = getData(i)
	})
	$scope.s = {model:0}
	function getApi(o,end){
		if(end){
			return API+'/'+o.table+'/'+end
		}
		return API+'/'+o.table+'/list'
	}
	function numeric(model,data){
		var list = model.option.numeric
		if(list&&list.length>0)angular.forEach(data,function(row){
			angular.forEach(list,function(label){
				row[label] = parseFloat(row[label])
			})
		})
		return data
	}
	function getData(i,force){
		var model = $scope.models[i]
		if(force||$scope.autoReload||!model.data){
			model.page = model.page||0
			model.api = getApi(model.option)
			$http.get(model.api+"?page="+model.page).success(function(res){
				model.data = numeric(model,res.data)
			})
		}
		return model
	}
	function changemodel(){
		var model = $scope.models[$scope.s.model]
		if(typeof model.option.edit=="undefined"){
			model.option.edit=false
			angular.forEach(model.option.label,function(label){
				if(label.edit)model.option.edit=true
			})
		}
		getData($scope.s.model)
		$scope.model = model
	}
	$scope.reload = function(){
		getData($scope.s.model,true)
	}
	$scope.$watch('s.model',changemodel)
	changemodel()
	$scope.order = function(label){
		if($scope.model.option.order==label){
			$scope.model.option.order="-"+label
		}else{
			$scope.model.option.order=label
		}
	}
	$scope.mask = false
	$scope.e = {}
	var editTable = angular.element(document.getElementById('editTable'))
	var editing = {}
	$scope.edit = function(e){
		$scope.e = {}
		if(e&&e.id){
			$scope.e.id = e.id
			editing = e
		}else{
			if($scope.model.option.init)angular.extend($scope.e,$scope.model.option.init)
			editing = false
		}
		editTable.empty()
		angular.forEach(!editing&&$scope.model.option.add?$scope.model.option.add:$scope.model.option.label,function(label){
			var tr
			if(label.edit){
				if(editing)$scope.e[label.label] = e[label.label]
			}
			if(!label.edit){
				if($scope.hideNoEdit)return;
				tr = '<tr class="disabled"><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9">'+(label.value?label.value(e[label.label],e):e[label.label])+'</td></tr>'
			}
			else if(typeof label.edit=="function"){
				tr = '<tr><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9">'+label.edit(editing?e[label.label]:$scope.e[label.label],editing?e:$scope.e)+'</td></tr>'
			}
			else if(label.edit instanceof Array){
				tr = '<tr><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9"><select ng-model="e.'+label.label+'">'
				angular.forEach(label.edit,function(o,i){
					tr+='<option value="'+i+'">'+o+'</option>'
				})
				tr+='</select></td></tr>'
			}
			else if(typeof label.edit=="object"){
				tr = '<tr><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9"><select ng-model="e.'+label.label+'">'
				angular.forEach(label.edit,function(o){
					tr+='<option value="'+o.value+'">'+o.label+'</option>'
				})
				tr+='</select></td></tr>'
			}
			else if(label.edit=="textarea"){
				tr = '<tr><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9"><textarea ng-model="e.'+label.label+'"></textarea></td></tr>'
			}
			else{
				tr = '<tr><td class="col-sm-3">'+label.name+'</td><td class="col-sm-9"><input type="text" ng-model="e.'+label.label+'"/></td></tr>'
			}
			tr = angular.element(tr)
			editTable.append($compile(tr)($scope))
		})
		$scope.mask = true
	}
	$scope.save = function(){
		$http.post(getApi($scope.model.option,editing?'update':'add'),$scope.e).success(function(res){
			if(res.code==0){
				if(editing)angular.extend(editing,res.data)
				else {
					if(res.data instanceof Array){
						angular.forEach(res.data,function(d){
							$scope.model.data.push(d)
						})
					}else $scope.model.data.push(res.data)
				}
				$scope.mask = false
			}else{
				alert(res.code)
			}
		}).error(function(){
			alert('网络错误')
		})
	}
	var checklist = []
	$scope.allchecked = function(){
		checklist = []
		var all = true
		angular.forEach($scope.model.data,function(d){
			if(d._checked)checklist.push(d.id)
			else all = false
		})
		return all
	}
	$scope.del = function(){
		if(checklist.length<1){
			alert("请选择要删除的项目")
			return
		}
		$http.post(getApi($scope.model.option,"del"),{ids:checklist}).success(function(res){
			if(res.code==0){
				var d = $scope.model.data
				for(var i=0;i<d.length;i++){
					if(d[i]._checked){
						d.splice(i,1)
						i--
					}
				}
			}else{
				alert('删除失败')
			}
		}).error(function(){
			alert('网络错误')
		})
	}
	$scope.checkall=function(e){
		angular.forEach($scope.model.data,function(d){
			d._checked = e.target.checked
		})
	}
	$scope.hideNoEdit = true
	$scope.autoReload = true
})