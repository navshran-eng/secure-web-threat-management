<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";


/* =========================================================
   GET FORM DATA
========================================================= */

$name = trim($_POST["name"] ?? "");
$email = strtolower(trim($_POST["email"] ?? ""));
$password = $_POST["password"] ?? "";


/* =========================================================
   VALIDATION
========================================================= */

if ($name === "" || $email === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);

    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Enter a valid email address."
    ]);

    exit;
}


if (strlen($password) < 8) {

    echo json_encode([
        "success" => false,
        "message" => "Password must contain at least 8 characters."
    ]);

    exit;
}


/* =========================================================
   CHECK EXISTING EMAIL
========================================================= */

$stmt = $conn->prepare(
    "SELECT id FROM users WHERE email = ? LIMIT 1"
);

$stmt->bind_param("s", $email);

$stmt->execute();

$result = $stmt->get_result();


if ($result->num_rows > 0) {

    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$stmt->close();


/* =========================================================
   HASH PASSWORD
========================================================= */

$hashedPassword = password_hash(
    $password,
    PASSWORD_DEFAULT
);


/* =========================================================
   INSERT USER
========================================================= */

$role = "user";
$status = "active";

$stmt = $conn->prepare(
    "INSERT INTO users
    (name, email, password, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())"
);

$stmt->bind_param(
    "sssss",
    $name,
    $email,
    $hashedPassword,
    $role,
    $status
);


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to create the account."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/* =========================================================
   SUCCESS
========================================================= */

echo json_encode([
    "success" => true,
    "message" => "Account created successfully."
]);


$stmt->close();
$conn->close();

?>