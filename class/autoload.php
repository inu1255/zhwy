<?php
require_once "common.php";

function myLoader($classname) {
	$class_file = str_replace("\\", DIRECTORY_SEPARATOR, __DIR__ . "\\" . $classname . '.php');
	if (file_exists($class_file)) {
		require_once $class_file;
	}
}
spl_autoload_register("myLoader");

use Overtrue\Wechat\Cache;
use Yasha\Model\CacheModel;

// 读取
Cache::getter(function ($key) {
	$pdo = getPDO();
	$m = new CacheModel($pdo);
	if ($m->find("where `key`='{$key}'")) {
		$m->next();
		return $m->expired_at > time() ? $m->value : null;
	}
	return null;
});
// 写入
Cache::setter(function ($key, $value, $lifetime) {
	$pdo = getPDO();
	$m = new CacheModel($pdo);
	if ($m->find("where `key`='{$key}'")) {
		$m->next();
		$m->value = $value;
		$m->expired_at = time() + $lifetime - 500;
		$m->update();
	} else {
		$m->value = $value;
		$m->expired_at = time() + $lifetime - 500;
		$m->key = $key;
		$m->insert();
	}
});