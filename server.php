<?php
// 微信服务器
require "class/autoload.php";

use Overtrue\Wechat\Message;
use Overtrue\Wechat\Server;
use Overtrue\Wechat\User;
use Yasha\Model\ManagerModel;
use Yasha\Model\UserModel;

$server = new Server(appId, token);

// 监听文字类型
$server->on('message', 'text', function ($message) {
	$pdo = getPDO();
	$token = $message["Content"];
	$openid = $message['FromUserName'];
	$m = new ManagerModel($pdo);
	if ($m->find("where token='{$token}'")) {
		$m->next();
		if ($m->uid > 0) {
			return Message::make('text')->content('该验证码已经使用，请联系管理员');
		}

		$u = new UserModel($pdo);
		if ($u->find("where openid='{$openid}'") < 1) {
			insertUser($openid);
			$u->find("where openid='{$openid}'");
		}
		$u->next();
		$m->uid = $u->id;
		$m->update();
		$u->type = 1;
		$u->cid = $m->cid;
		$u->update();
		return Message::make('text')->content('绑定成功');
	}
	return Message::make('text')->content('绑定失败，验证码不存在，请联系管理员');
});

// 监听图片消息
// $server->on('message', 'image', function($message) {
//     return Message::make('text')->content('我们已经收到您发送的图片！');
// });
function insertUser($openid) {
	$pdo = getPDO();
	$sql = "INSERT INTO `user`(openid) select '{$openid}' from dual where not exists(select 1 from `user` where openid='{$openid}')";
	$pdo->exec($sql);
	$userService = new User(appId, secret);
	$user = $userService->get($openid);
	$city = $user->city;
	$nickname = $user->nickname;
	$country = $user->country;
	$province = $user->province;
	$headimgurl = $user->headimgurl;
	$sql = "update user set subscribe=1,city='{$city}',province='{$province}',nickname='{$nickname}',country='{$country}',headimgurl='{$headimgurl}' where openid='{$openid}'";
	$pdo->exec($sql);
}
$server->on('event', 'subscribe', function ($message) {
	$openid = $message['FromUserName'];
	insertUser($openid);
	return Message::make('text')->content("感谢您的关注");
});

$server->on('event', 'unsubscribe', function ($message) {
	$pdo = getPDO();
	$openid = $message['FromUserName'];
	$sql = "update user set subscribe=0 where openid='{$openid}'";
	$pdo->exec($sql);
});

// $server->on('event', 'view', function($message) {
// 	$pdo = getPDO();
// 	$openid = $message['FromUserName'];
// 	$sql = "INSERT INTO `user`(openid) select '{$openid}' from dual where not exists(select 1 from `user` where openid='{$openid}')";
// 	$pdo->exec($sql);
// });

$result = $server->serve();

if (empty($result)) {
	$data_string = file_get_contents("php://input");
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, "http://lyl12z67.sinaapp.com/hello.php"); //"http://wx.weikuaibo.com/index.php?g=Home&m=Weixin&a=index&token=qsugro1405932537");
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'Content-Length: ' . strlen($data_string))
	);
	curl_exec($ch);
	$result = curl_exec($ch);
	echo $result;
} else {
	echo $result;
}