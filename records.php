<?php
$mysqli = new mysqli('localhost', 'root', '','otbor');
$mysqli->query("INSERT INTO `records` (`id`, `username`, `score`, `time`) VALUES (NULL, '".$_POST['username']."', '".$_POST['score']."', '".$_POST['time']."')");
$top = $mysqli->query('SELECT * FROM `records` ORDER BY score DESC, time ASC');
$cur = $mysqli->query("SELECT * FROM `records` WHERE `username` = '".$_POST['username']."' and `score` = '".$_POST['score']."' and `time` = '".$_POST['time']."'")->fetch_assoc();
$responce = [];
$responce['cur'] = $cur;
$responce['top'] = [];
while($row = $top->fetch_assoc()){
    $responce['top'][] = $row;
}
echo json_encode($responce);