<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, name, email, password, role, status
     FROM users
     WHERE email = ?
     LIMIT 1"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "SQL prepare error: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("s", $email);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "SQL execute error: " . $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}

$status = strtolower(
    trim($user["status"] ?? "active")
);

if ($status !== "active") {
    echo json_encode([
        "success" => false,
        "message" => "Your account is " . $status . "."
    ]);
    exit;
}

session_regenerate_id(true);

$_SESSION["user_id"] = $user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["role"] = $user["role"];

echo json_encode([
    "success" => true,
    "message" => "Login successful."
]);

$stmt->close();
$conn->close();

?>