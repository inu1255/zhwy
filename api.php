<?php
session_start();
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Yasha');
header("Content-type:text/html;charset=utf-8");
require "class/autoload.php";

use Overtrue\Wechat\Auth;
use Overtrue\Wechat\Menu;
use Overtrue\Wechat\MenuItem;
use Overtrue\Wechat\Staff;
use Yasha\Model\CompanyModel;
use Yasha\Model\ManagerModel;
use Yasha\Model\Model;
use Yasha\Model\OrderModel;
use Yasha\Model\ServiceModel;
use Yasha\Model\UserModel;
use Yasha\Router\RESTRouter;

$pdo = getPDO();
$ID = 0;
// if (!empty($_GET["openid"])) {
// 	$_SESSION["openid"] = $_GET["openid"];
// }
if (!empty($_SESSION["openid"])) {
	$user = new UserModel($pdo);
	$user->find("where openid='" . $_SESSION["openid"] . "'");
	if ($user->next()) {
		$ID = $user->id;
	}

}
define("ID", 1); //$ID);
define("ADMIN", 1);
$router = new RESTRouter($pdo);
/*********************************************************

ROUTER

 **********************************************************/

$router->bind("/user/login", function ($match, $pdo) {
	$_SESSION['openid'] = $_GET['openid'];
	echo $_SESSION['openid'];
});

$router->bind("/user/logout", function ($match, $pdo) {
	echo $_SESSION['openid'];
	unset($_SESSION['openid']);
});

$router->bind("/user/current", function ($match, $pdo) {
	$m = new UserModel($pdo, ID);
	if ($m->cid > 0) {
		$c = new CompanyModel($pdo, $m->cid);
		$m->company = $c->name;
	}
	apiMsg(0, '', $m->data);
});

$router->bind("/score/rank", function ($match, $pdo) {
	$m = new UserModel($pdo, ID);
	$sql = "select id,headimgurl,nickname name,t.score from user,(select uid,sum(cscore) score from `order` where status=0 and amount>0 and cid=" . $m->cid . " group by uid) as t where user.id=t.uid";
	$rs = $pdo->query($sql, \PDO::FETCH_ASSOC);
	$res[] = $rs->fetchAll();
	$sql = "select id cid,name,score from company order by score limit 30";
	$rs = $pdo->query($sql, \PDO::FETCH_ASSOC);
	$res[] = $rs->fetchAll();
	$sql = "select id,headimgurl,nickname name,score from user order by score limit 30";
	$rs = $pdo->query($sql, \PDO::FETCH_ASSOC);
	$res[] = $rs->fetchAll();
	apiMsg(0, '', $res);
});

$router->bind("/service/(\d+)", function ($match, $pdo) {
	$m = new ServiceModel($pdo, $match[1]);
	$data = $m->data;
	$m = new OrderModel($pod);
	$data['exist'] = $m->find("where status>0 and status<4 and sid='{$match[1]}' and uid=" . ID);
	apiMsg(0, '', $data);
});

$router->bind("/order/service", function ($match, $pdo, $post) {
	if (ID < 1) {
		apiMsg(1, '用户信息过期，请从微信菜单进入');
	}
	$u = new UserModel($pdo, ID);
	$u->name = $post["name"];
	if ($u->type < 1) {
		$u->cid = $post["cid"];
	} else if ($post["cid"] != $u->cid) {
		apiMsg(7, "您不属于该公司");
	}

	$u->telphone = $post["telphone"];
	$u->remark = $post["remark"];
	$m = new OrderModel($pdo);
	if (empty($post["sid"])) {
		apiMsg(3, "未知服务");
	}
	$s = new ServiceModel($pdo, $post["sid"]);
	if ($s->type == 2) {
		if ($u->type < 1) {
			apiMsg(5, '你没有权限兑换');
		}
		$post["amount"] = 0;
		$post["score"] = $s->price * $post["num"];
		if ($post["type"] == 1) {
			if ($u->score < $post["score"]) {
				apiMsg(4, '个人积分不足,还差' . ($post["score"] - $u->score) . '分');
			}
			$u->score = $u->score - $s->price;
		} else {
			$post["type"] = 2;
			if ($u->cid < 1) {
				apiMsg(6, "你没有公司");
			}

			$c = new CompanyModel($pdo, $u->cid);
			if ($c->score < $post["score"]) {
				apiMsg(4, '公司积分不足,还差' . ($post["score"] - $c->score) . '分');
			}
			$c->score = $c->score - $post["score"];
			$c->update();
		}
	} else if ($s->type == 3 && !empty($post["type"])) {
		if ($u->type < 1) {
			apiMsg(5, '你没有权限兑换');
		}

		if ($post["type"] == 1) {
			$post["amount"] = $s->price * $post["num"];
			$t = $post["amount"] - $u->score / 100;
			if ($t > 0) {
				$post["amount"] = $t;
				$post["score"] = $u->score;
				$u->score = 0;
			} else {
				$post["score"] = $post["amount"] * 100;
				$u->score -= $post["score"];
				$post["amount"] = 0;
			}
		} else {
			$post["type"] = 2;
			if ($u->cid < 1) {
				apiMsg(6, "你没有公司");
			}

			$c = new CompanyModel($pdo, $u->cid);
			$post["amount"] = $s->price * $post["num"];
			$t = $post["amount"] - $c->score / 100;
			if ($t > 0) {
				$post["amount"] = $t;
				$post["score"] = $c->score;
				$c->score = 0;
			} else {
				$post["score"] = $post["amount"] * 100;
				$c->score -= $post["score"];
				$post["amount"] = 0;
			}
			$c->update();
		}
	} else {
		$post["type"] = 0;
		$post["amount"] = $s->price * $post["num"];
		$post["score"] = 0;
	}
	$u->update();
	$post["cscore"] = $u->cid > 0 ? $s->cscore * $post["num"] : 0;
	$post["uscore"] = $u->type > 0 ? $s->uscore * $post["num"] : 0;
	if ($m->insert($post)) {
		$u->find("where type=2");
		while ($u->next()) {
			try {
				$staff = new Staff(appId, secret);
				$message = $post["name"] . ",手机:" . $post["telphone"] . "预定了【" . $s->name . "】";
				$staff->send($message)->to($u->openid);
			} catch (\Exception $e) {

			}
		}
		apiMsg(0, '', $m->data);
	}
	apiMsg(2, '预定失败');
});

$router->bind("/order/current", function ($match, $pdo) {
	if (ID < 1) {
		apiMsg(1, '用户信息过期，请从微信菜单进入');
	}
	$sql = "select o.id,o.cid,s.name,s.img,s.description,s.unit,o.score,o.amount,o.num,o.type,o.cscore,o.uscore,s.price,o.sid,o.time,o.status from `order` o,service s where o.uid=" . ID . " and o.sid=s.id and o.status<4";
	$rs = $pdo->query($sql, \PDO::FETCH_ASSOC);
	apiMsg(0, '', $rs->fetchAll());
});

$router->bind("/order/cancel/(\d+)", function ($match, $pdo) {
	if (ID < 1) {
		apiMsg(1, '用户信息过期，请从微信菜单进入');
	}
	$m = new OrderModel($pdo, $match[1]);
	if ($m->status == 4) {
		apiMsg(2, "已经取消");
	}
	if ($m->status != 1) {
		apiMsg(2, "只有【等待接单】状态才能取消");
	}
	if ($m->score > 0) {
		if ($m->type == 1) {
			$u = new UserModel($pdo, $m->uid);
			$u->score += $m->score;
			$u->update();
		} else {
			$c = new CompanyModel($pdo, $m->cid);
			$c->score += $m->score;
			$c->update();
		}
	}
	$m->status = 4;
	if ($m->update()) {
		apiMsg(0, '');
	}
	apiMsg(1, '取消失败');
});

$router->bind("/order/update", function ($match, $pdo, $post) {
	if (ADMIN != 1) {
		apiMsg(1, '身份验证错误');
	}
	$m = new OrderModel($pdo, $post["id"]);
	$u = new UserModel($pdo, $m->uid);
	$c = new CompanyModel($pdo, $m->cid);
	if (isset($post["status"]) && $post["status"] != $m->status) {
		if ($post["status"] == 0) {
			if ($u->cid > 0) {
				$c->score += (isset($post["cscore"]) ? $post["cscore"] : $m->cscore);
			}
			if ($u->type > 0) {
				$u->score += (isset($post["uscore"]) ? $post["uscore"] : $m->uscore);
			}
		}
		if ($m->status == 0) {
			if ($u->cid > 0) {
				$c->score -= ($m->cscore);
			}
			if ($u->type > 0) {
				$u->score -= ($m->uscore);
			}
		}
	} else if ($m->status == 0) {
		if ($u->cid > 0 && isset($post["cscore"]) && $m->cscore != $post["cscore"]) {
			$c->score += ($post["cscore"] - $m->cscore);
		}
		if ($u->type > 0 && isset($post["uscore"]) && $m->uscore != $post["uscore"]) {
			$u->score += ($post["uscore"] - $m->uscore);
		}
	}
	if ($m->status != $post["status"] && $m->score > 0) {
		if ($post["status"] == 4) {
			if ($m->type == 1) {
				$u->score += $m->score;
			} else {
				$c->score += $m->score;
			}
		} else if ($m->status == 4) {
			if ($m->type == 1) {
				$u->score -= $m->score;
			} else {
				$c->score -= $m->score;
			}
		}
	}
	$c->update();
	$u->update();
	$s = $m->update($post);
	if ($s) {
		apiMsg(0, '', $post);
	} else {
		apiMsg(1);
	}
});

$router->bind("/manager/add", function ($match, $pdo, $post) {
	if (ADMIN != 1) {
		apiMsg(1, '身份验证错误');
	}
	$m = new ManagerModel($pdo);
	if (empty($post["num"])) {
		$m->cid = $post["cid"];
		$m->token = md5(time() . rand());
		if ($m->insert()) {
			apiMsg(0, '', $m->data);
		} else {
			apiMsg(1);
		}
	} else {
		$res = array();
		$num = $post["num"] > 1000 ? 1000 : $post["num"];
		for ($i = 0; $i < $num; $i++) {
			$m->cid = $post["cid"];
			$m->token = md5(time() . rand());
			$m->insert();
			$res[] = $m->data;
		}
		apiMsg(0, '', $res);
	}
});

$router->bind("/(\w+)/list", function ($match, $pdo) {
	$m = new Model($pdo);
	$m->tablename = $match[1];
	apiMsg(0, '', $m->findall());
});

$router->bind("/(\w+)/add", function ($match, $pdo, $post) {
	if (ADMIN != 1) {
		apiMsg(1, '身份验证错误');
	}
	$m = new Model($pdo);
	$m->tablename = $match[1];
	$m->data = $post;
	if ($m->insert()) {
		apiMsg(0, '', $m->data);
	} else {
		apiMsg(1);
	}

});

$router->bind("/(\w+)/del", function ($match, $pdo, $post) {
	if (ADMIN != 1) {
		apiMsg(1, '身份验证错误');
	}
	if (!empty($post["ids"])) {
		$ids = join(",", $post["ids"]);
		$sql = "delete from `{$match[1]}` where id in ({$ids})";
		if ($pdo->exec($sql)) {
			apiMsg(0);
		} else {
			apiMsg(1, $sql);
		}

	}
	$m = new Model($pdo);
	$m->tablename = $match[1];
	if ($m->delete($post["id"])) {
		apiMsg(0, '', $m->data);
	} else {
		apiMsg(1);
	}
});

$router->bind("/(\w+)/update", function ($match, $pdo, $post) {
	if (ADMIN != 1) {
		apiMsg(1, '身份验证错误');
	}

	$m = new Model($pdo);
	$m->tablename = $match[1];
	if ($m->update($post, $post["id"])) {
		apiMsg(0, '', $post);
	} else {
		apiMsg(1);
	}
});

$router->bind("/auth", function ($match, $pdo) {
	$redirect = 'http://' . $_SERVER['HTTP_HOST'] . "/api.php/redirect";
	$auth = new Auth(appId, secret);
	if (ID == 0) {
		try {
			$auth->authorize($to = $redirect, $scope = 'snsapi_userinfo', $state = $_GET["url"]);
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	} else {
		header("Location:" . $_GET["url"]);
	}
});

$router->bind("/redirect", function ($match, $pdo) {
	$auth = new Auth(appId, secret);
	$user = $auth->user();
	$_SESSION["openid"] = $user->openid;
	$m = new UserModel($pdo);
	$m->find("where openid='{$_SESSION["openid"]}'");
	$m->next();

	$m->openid = $user->openid;
	$m->city = $user->city;
	$m->nickname = $user->nickname;
	$m->sex = $user->sex;
	$m->country = $user->country;
	$m->province = $user->province;
	$m->headimgurl = $user->headimgurl;
	if ($m->id) {
		$m->update();
	} else {
		$m->insert();
	}

	//echo "redirect:" . $_GET["state"];
	header("Location:" . $_GET["state"]);
});

$router->bind("/createmenu", function ($match, $pdo) {
	$menu = new Menu(appId, secret);
	$button1 = new MenuItem("office 公社", 'click', '首页');
	$button2 = new MenuItem("公告栏");
	$button3 = new MenuItem("服务栏");
	$menus = array(
		$button1,
		$button2->buttons(array(
			new MenuItem('小喇叭', 'click', '小喇叭'),
			new MenuItem('消息树', 'click', '消息树'),
			new MenuItem('公社福利', 'click', '公社福利'),
		)),
		$button3->buttons(array(
			new MenuItem('我的积分', 'view', 'http://ya1255.sinaapp.com/api.php/auth?url=html/order.html'),
			new MenuItem('服务预定', 'view', 'http://ya1255.sinaapp.com/api.php/auth?url=html/index.html'),
			new MenuItem('积分排行', 'view', 'http://ya1255.sinaapp.com/api.php/auth?url=html/rank.html'),
		)),
	);
	try {
		$menu->set($menus); // 请求微信服务器
		echo '设置成功！';
	} catch (\Exception $e) {
		echo '设置失败：' . $e->getMessage();
	}
});

$router->serve(function ($path) {
	header("Location:" . $path);
});