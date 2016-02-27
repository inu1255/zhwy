<?php
namespace Yasha\Router;

/**
 *
 */
class Router {
	private $_e;
	private $_fifo;

	function encode($path) {
		return "/^" . str_replace("/", "\\/", $path) . "$/";
	}

	public function bind($path, $callback) {
		$path = $this->encode($path);
		$n = count($this->_fifo);
		for ($i = 0; $i < $n; $i++) {
			if ($this->_fifo[$i] == $path) {
				array_splice($i, 1);
				break;
			}
		}
		$this->_e[$path] = $callback;
		$this->_fifo[] = $path;
	}

	public function get($path) {
		$path = $this->encode($path);
		return $this->_e[$path];
	}

	public function serve($default = null) {
		$n = count($this->_fifo);
		for ($i = 0; $i < $n; $i++) {
			$path = $this->_fifo[$i];
			$callback = $this->_e[$path];
			if (preg_match($path, $_SERVER["PATH_INFO"], $match)) {
				call_user_func($callback, $match);
				return;
			}
		}
		if (is_callable($default)) {
			call_user_func($default, $_SERVER["PATH_INFO"]);
		}

	}
}