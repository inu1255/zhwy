<?php
namespace Yasha\Router;
/**
 *
 */
class RESTRouter extends Router {
	private $pdo;
	private $post;
	public function __construct($pdo = null) {
		$json = file_get_contents("php://input");
		if (!empty($json)) {
			$this->post = json_decode($json, true);
			if (empty($this->post)) {
				$this->post = $json;
			}

		}
		if (empty($pdo)) {
			$this->pdo = getPDO();
		} else {
			$this->pdo = $pdo;
		}

	}
	public function bind($path, $type, $callback = null) {
		if (!isset($callback)) {
			$callback = $type;
			$type = "ALL";
		}
		for ($i = 0; $i < $n; $i++) {
			if ($this->_fifo[$i] == $path) {
				array_splice($i, 1);
				break;
			}
		}
		$path = $this->encode($path);
		$this->_e[$path][$type] = $callback;
		$this->_fifo[] = $path;
	}

	public function get($path, $type = "ALL") {
		$path = $this->encode($path);
		return empty($this->_e[$path]) ? null : $this->_e[$path][$type];
	}

	public function serve($default = null) {
		$type = $_SERVER["REQUEST_METHOD"];
		$n = count($this->_fifo);
		for ($i = 0; $i < $n; $i++) {
			$path = $this->_fifo[$i];
			$hander = $this->_e[$path];
			if (preg_match($path, $_SERVER["PATH_INFO"], $match)) {
				if (isset($hander[$type])) {
					call_user_func_array($hander[$type], array($match, $this->pdo, $this->post));
					return;
				}
				if (isset($hander["ALL"])) {
					call_user_func_array($hander["ALL"], array($match, $this->pdo, $this->post));
					return;
				}
			}
		}
		if (is_callable($default)) {
			call_user_func($default, $_SERVER["PATH_INFO"]);
		}

	}
}