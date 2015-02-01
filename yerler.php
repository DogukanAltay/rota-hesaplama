<?php

$pdo = new PDO('mysql:dbname=lojistik;host=127.0.0.1;charset=UTF8', 'root', '');

$query = $pdo->prepare('SELECT id, name, lat, lng FROM locations');
$query->execute();

echo json_encode($query->fetchAll(PDO::FETCH_OBJ));
