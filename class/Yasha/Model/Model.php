<?php
namespace Yasha\Model;
/**
 *
 */
class Model {
	protected $pdo;
	protected $rs;
	protected $_id;
	public $data;
	public $tablename;
	public function __construct($pdo = null, $id = 0) {
		if (empty($pdo)) {
			$this->pdo = getPDO();
		} else {
			$this->pdo = $pdo;
		}

		$this->_getById($id);
	}
	public function getData() {
		return $this->data;
	}
	public function what() {
		return '*';
	}
	public function tableName() {
		if (!empty($this->tablename)) {
			return $this->tablename;
		}

		$name = get_class($this);
		$name = explode('\\', $name);
		return $name[count($name) - 1];
	}
	public function insert($data = null) {
		if (empty($data)) {
			$data = $this->getData();
		}

		$sql = "insert `" . $this->tableName() . "` ";
		$ins = "";
		$arr = array();
		foreach ($data as $key => $value) {
			if ($key == "id") {
				continue;
			}

			if (empty($ins)) {
				$sql .= "(`{$key}`";
				$ins .= "(?";
			} else {
				$sql .= ",`{$key}`";
				$ins .= ",?";
			}
			$arr[] = $value;
		}
		$sql = $sql . ") values" . $ins . ")";
		$stm = $this->pdo->prepare($sql);
		$res = $stm->execute($arr);
		//var_dump($stm->errorinfo());
		$this->_getById($this->pdo->lastInsertId());
		return $res;
	}
	public function update($data = null, $id = 0) {
		if (empty($data)) {
			$data = $this->getData();
		}
		if ($id < 1) {
			$id = $this->_id;
		}

		$sql = "";
		$arr = array();
		foreach ($data as $key => $value) {
			if ($key == "id") {
				continue;
			}

			if (empty($sql)) {
				$sql .= "update `" . $this->tableName() . "` set `{$key}`=?";
			} else {
				$sql .= ",`{$key}`=?";
			}
			$arr[] = $value;
		}
		$sql = $sql . " where id='" . ($id) . "'";
		$stm = $this->pdo->prepare($sql);
		$res = $stm->execute($arr);
		//var_dump($stm->errorinfo());
		return $res;
	}
	public function delete($id) {
		if (empty($id)) {
			$id = $this->_id;
		}

		$sql = "delete from " . $this->tableName() . " where id='" . $id . "'";
		$stm = $this->pdo->prepare($sql);
		$res = $stm->execute($arr);
		//var_dump($stm->errorinfo());
		return $res;
	}
	public function _getById($id) {
		$this->_id = $id;
		if (!empty($id)) {
			$sql = "select " . $this->what() . " from `" . $this->tableName() . "` where id='{$id}'";
			$rs = $this->pdo->query($sql);
			if ($rs) {
				$data = $rs->fetch(\PDO::FETCH_ASSOC);
			}

			if (!empty($data)) {
				return $this->data = $data;
			}

		}
	}
	public function find($where = "", $what = '') {
		if (empty($what)) {
			$sql = "select " . $this->what() . " from `" . $this->tableName() . "` " . $where;
		} else {
			$sql = "select " . $what . " from `" . $this->tableName() . "` " . $where;
		}
		$this->rs = $this->pdo->query($sql);
		if ($this->rs) {
			return $this->rs->rowCount();
		}
		return false;
	}
	public function findall($where = "", $what = '') {
		if (empty($what)) {
			$sql = "select " . $this->what() . " from `" . $this->tableName() . "` " . $where;
		} else {
			$sql = "select " . $what . " from `" . $this->tableName() . "` " . $where;
		}

		$rs = $this->pdo->query($sql);
		return $rs->fetchAll(\PDO::FETCH_ASSOC);
	}
	public function next() {
		if ($this->rs) {
			$data = $this->rs->fetch(\PDO::FETCH_ASSOC);
			$this->_id = $data["id"];
			if ($data) {
				return $this->data = $data;
			}

		}
		return false;
	}
	public function __get($key) {
		if (isset($this->data[$key])) {
			return $this->data[$key];
		}
	}
	public function __set($key, $value) {
		return $this->data[$key] = $value;
	}
}