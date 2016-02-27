<?php
session_start();
header("Content-type:text/html;charset=utf-8");
require "class/autoload.php";

exit();
use Yasha\Model\CacheModel;
$key = "overtrue.wechat.access_token";
$value = "124";
$lifetime = "1234";
$pdo = getPDO();
$m = new CacheModel($pdo);
if ($m->find("where key='{$key}'")) {
	$m->next();
	$m->value = $value;
	$m->expired_at = time() + $lifetime - 500;
	echo "update";
	var_dump($m->data);
} else {
	$m->value = $value;
	$m->expired_at = time() + $lifetime - 500;
	$m->key = $key;
	echo "insert";
	var_dump($m->data);
}
exit();
phpinfo();
?>
// 中海
{
    "menu": {
        "button": [
            {
                "type": "click",
                "name": "office 公社",
                "key": "首页",
                "sub_button": [ ]
            },
            {
                "name": "公社服务",
                "sub_button": [
                    {
                        "type": "click",
                        "name": "小喇叭",
                        "key": "小喇叭",
                        "sub_button": [ ]
                    },
                    {
                        "type": "click",
                        "name": "office call",
                        "key": "office call",
                        "sub_button": [ ]
                    },
                    {
                        "type": "click",
                        "name": "消息树",
                        "key": "消息树",
                        "sub_button": [ ]
                    },
                    {
                        "type": "click",
                        "name": "朋友圈",
                        "key": "朋友圈",
                        "sub_button": [ ]
                    }
                ]
            },
            {
                "name": "公社福利",
                "sub_button": [
                    {
                        "type": "click",
                        "name": "长假快乐",
                        "key": "中秋吃月饼",
                        "sub_button": [ ]
                    },
                    {
                        "type": "click",
                        "name": "每周一歌",
                        "key": "每周一歌",
                        "sub_button": [ ]
                    }
                ]
            }
        ]
    }
}