<?php

/* =========================================================
   DATABASE CONNECTION
   Secure Web - MySQL
========================================================= */

$host = "localhost";
$username = "root";
$password = "";
$database = "secure_web";


/* CREATE CONNECTION */

$conn = new mysqli(
    $host,
    $username,
    $password,
    $database
);


/* CHECK CONNECTION */

if ($conn->connect_error) {

    die(
        "Database connection failed: " .
        $conn->connect_error
    );

}


/* SET CHARACTER ENCODING */

$conn->set_charset("utf8mb4");

?>