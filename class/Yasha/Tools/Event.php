<?php
namespace Yasha\Tools;
/**
* 
*/
class Event
{
    protected $_e;
    public function __set($name,$value){
    	$name = strtolower($name);
        if( strncmp($name,"on",2) === 0 ){
        	$name = substr($name,2);
            $this->bind($name,$value);
        }
    }
    
    public function __get($name){
    	$name = strtolower($name);
        if( strncmp($name,"on",2) === 0 ){
        	$name = substr($name,2);
            $this->get($name);
        }
    }

    public function bind($name,$value){
        if(!isset($this->_e[$name]))
            $this->_e[$name] = array();
        return array_push($this->_e[$name] , $value);
    }

    public function get($name){
        if(!isset($this->_e[$name]))
            $this->_e[$name] = array();
        return $this->_e[$name];
    }

    public function fire($name, $parse=null){
         if(isset($this->_e[$name])){
             foreach($this->_e[$name] as $handler)
                call_user_func($handler,$parse);
         }
    }
}