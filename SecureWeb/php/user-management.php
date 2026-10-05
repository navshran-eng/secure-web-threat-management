<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

// ==========================================
// AUTHENTICATION
// ==========================================

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);

    exit;
}

if (
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "admin"
) {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Administrator access required."
    ]);

    exit;
}

// ==========================================
// FILE PATH
// ==========================================

$usersFile = dirname(__DIR__) . "/data/users.json";

// ==========================================
// CHECK FILE
// ==========================================

if (!file_exists($usersFile)) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Users data file not found."
    ]);

    exit;
}

// ==========================================
// LOAD USERS
// ==========================================

$json = file_get_contents($usersFile);

if ($json === false) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to read users data."
    ]);

    exit;
}

$users = json_decode($json, true);

if (!is_array($users)) {
    $users = [];
}

// ==========================================
// REQUEST INFORMATION
// ==========================================

$method = $_SERVER["REQUEST_METHOD"];

$action = $_GET["action"] ?? "";

if ($method === "POST") {
    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (is_array($input)) {
        $action = $input["action"] ?? $action;
    }
}

// ==========================================
// REMOVE SENSITIVE INFORMATION
// ==========================================

function sanitizeUser($user)
{
    unset($user["password"]);
    unset($user["password_hash"]);

    return $user;
}

// ==========================================
// SAVE USERS
// ==========================================

function saveUsers($file, $users)
{
    $json = json_encode(
        $users,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents(
        $file,
        $json,
        LOCK_EX
    ) !== false;
}

// ==========================================
// FIND USER INDEX
// ==========================================

function findUserIndex($users, $userId)
{
    foreach ($users as $index => $user) {

        if (
            isset($user["id"]) &&
            (string)$user["id"] === (string)$userId
        ) {
            return $index;
        }

        if (
            isset($user["user_id"]) &&
            (string)$user["user_id"] === (string)$userId
        ) {
            return $index;
        }

        if (
            isset($user["username"]) &&
            (string)$user["username"] === (string)$userId
        ) {
            return $index;
        }
    }

    return -1;
}

// ==========================================
// GET USERS
// ==========================================

if (
    $method === "GET" &&
    (
        $action === "" ||
        $action === "list" ||
        $action === "users"
    )
) {

    $search = trim(
        $_GET["search"] ?? ""
    );

    $searchLower = strtolower($search);

    $result = [];

    foreach ($users as $user) {

        if (!is_array($user)) {
            continue;
        }

        if ($searchLower !== "") {

            $name = strtolower(
                (string)($user["name"] ?? "")
            );

            $username = strtolower(
                (string)($user["username"] ?? "")
            );

            $email = strtolower(
                (string)($user["email"] ?? "")
            );

            $role = strtolower(
                (string)($user["role"] ?? "")
            );

            if (
                strpos($name, $searchLower) === false &&
                strpos($username, $searchLower) === false &&
                strpos($email, $searchLower) === false &&
                strpos($role, $searchLower) === false
            ) {
                continue;
            }
        }

        $result[] = sanitizeUser($user);
    }

    echo json_encode([
        "success" => true,
        "users" => $result,
        "total" => count($result)
    ]);

    exit;
}

// ==========================================
// UPDATE USER
// ==========================================

if (
    $method === "POST" &&
    $action === "update"
) {

    $userId =
        $input["user_id"] ??
        $input["id"] ??
        "";

    $role =
        $input["role"] ??
        null;

    $status =
        $input["status"] ??
        null;

    if ($userId === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "User ID is required."
        ]);

        exit;
    }

    $index =
        findUserIndex(
            $users,
            $userId
        );

    if ($index === -1) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "User not found."
        ]);

        exit;
    }

    // --------------------------------------
    // Prevent administrator from accidentally
    // removing their own administrator role.
    // --------------------------------------

    $currentUserId =
        (string)$_SESSION["user_id"];

    $targetUserId = "";

    if (isset($users[$index]["id"])) {
        $targetUserId =
            (string)$users[$index]["id"];
    } elseif (
        isset($users[$index]["user_id"])
    ) {
        $targetUserId =
            (string)$users[$index]["user_id"];
    }

    if (
        $targetUserId === $currentUserId &&
        $role !== null &&
        $role !== "admin"
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "You cannot remove your own administrator role."
        ]);

        exit;
    }

    // --------------------------------------
    // Validate role
    // --------------------------------------

    if ($role !== null) {

        $allowedRoles = [
            "user",
            "admin"
        ];

        if (!in_array(
            $role,
            $allowedRoles,
            true
        )) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid user role."
            ]);

            exit;
        }

        $users[$index]["role"] =
            $role;
    }

    // --------------------------------------
    // Validate status
    // --------------------------------------

    if ($status !== null) {

        $allowedStatuses = [
            "active",
            "inactive",
            "blocked",
            "suspended"
        ];

        if (!in_array(
            strtolower($status),
            $allowedStatuses,
            true
        )) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid account status."
            ]);

            exit;
        }

        $users[$index]["status"] =
            strtolower($status);
    }

    // --------------------------------------
    // Save
    // --------------------------------------

    if (!saveUsers(
        $usersFile,
        $users
    )) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to save user changes."
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" =>
            "User updated successfully.",
        "user" =>
            sanitizeUser(
                $users[$index]
            )
    ]);

    exit;
}

// ==========================================
// DELETE USER
// ==========================================

if (
    $method === "POST" &&
    $action === "delete"
) {

    $userId =
        $input["user_id"] ??
        $input["id"] ??
        "";

    if ($userId === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "User ID is required."
        ]);

        exit;
    }

    $index =
        findUserIndex(
            $users,
            $userId
        );

    if ($index === -1) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "User not found."
        ]);

        exit;
    }

    // --------------------------------------
    // Prevent deleting yourself
    // --------------------------------------

    $currentUserId =
        (string)$_SESSION["user_id"];

    $targetUserId = "";

    if (isset($users[$index]["id"])) {
        $targetUserId =
            (string)$users[$index]["id"];
    } elseif (
        isset($users[$index]["user_id"])
    ) {
        $targetUserId =
            (string)$users[$index]["user_id"];
    }

    if (
        $targetUserId === $currentUserId
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "You cannot delete your own account."
        ]);

        exit;
    }

    array_splice(
        $users,
        $index,
        1
    );

    if (!saveUsers(
        $usersFile,
        $users
    )) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to delete user."
        ]);

        exit;
    }

    echo json_encode([
        "success" => true,
        "message" =>
            "User deleted successfully."
    ]);

    exit;
}

// ==========================================
// UNKNOWN ACTION
// ==========================================

http_response_code(400);

echo json_encode([
    "success" => false,
    "message" => "Invalid user management action."
]);

exit;
?>