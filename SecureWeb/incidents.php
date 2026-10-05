<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "php/db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

$stmt = $conn->prepare("
    SELECT
        id,
        type AS threat_type,
        target,
        risk_level,
        risk_score AS score,
        indicators,
        status,
        detected_at AS created_at
    FROM threats
    WHERE user_id = ?
    ORDER BY detected_at DESC
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "SQL prepare error: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "SQL execute error: " . $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();

$incidents = [];

while ($row = $result->fetch_assoc()) {
    $incidents[] = $row;
}

echo json_encode([
    "success" => true,
    "incidents" => $incidents
]);

$stmt->close();
$conn->close();
?>