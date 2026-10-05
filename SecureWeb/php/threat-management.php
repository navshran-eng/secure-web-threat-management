<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

$dataFile = __DIR__ . "/../data/threats.json";

/* AUTHENTICATION */
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);
    exit;
}

if (($_SESSION["role"] ?? "") !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Administrator access required."
    ]);
    exit;
}

/* HELPER FUNCTIONS */
function loadThreats($file)
{
    if (!file_exists($file)) {
        return [];
    }

    $contents = file_get_contents($file);

    if ($contents === false || trim($contents) === "") {
        return [];
    }

    $data = json_decode($contents, true);

    return is_array($data) ? $data : [];
}

function saveThreats($file, $threats)
{
    $json = json_encode(
        $threats,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents($file, $json, LOCK_EX) !== false;
}

function cleanText($value)
{
    return trim((string) $value);
}

/* REQUEST INFORMATION */
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $action = cleanText($_GET["action"] ?? "list");
} else {
    $action = cleanText($_POST["action"] ?? "");
}

/* LOAD THREATS */
$threats = loadThreats($dataFile);

/* LIST / FILTER THREATS */
if ($method === "GET" && in_array($action, ["list", "threats"], true)) {

    $search = strtolower(cleanText($_GET["search"] ?? ""));
    $risk = strtolower(cleanText($_GET["risk"] ?? "all"));
    $status = strtolower(cleanText($_GET["status"] ?? "all"));

    $filteredThreats = [];

    foreach ($threats as $threat) {

        if (!is_array($threat)) {
            continue;
        }

        // Support both the old "risk" field and current "risk_level" field.
        $threatRisk = strtolower(cleanText(
            $threat["risk_level"] ?? $threat["risk"] ?? ""
        ));

        $threatStatus = strtolower(cleanText(
            $threat["status"] ?? "open"
        ));

        $type = strtolower(cleanText(
            $threat["type"] ?? $threat["threat_type"] ?? ""
        ));

        $target = strtolower(cleanText($threat["target"] ?? ""));
        $message = strtolower(cleanText($threat["message"] ?? ""));

        /* RISK FILTER */
        if ($risk !== "" && $risk !== "all" && $threatRisk !== $risk) {
            continue;
        }

        /* STATUS FILTER */
        if ($status !== "" && $status !== "all" && $threatStatus !== $status) {
            continue;
        }

        /* SEARCH */
        if ($search !== "") {
            $searchFound =
                strpos($type, $search) !== false ||
                strpos($target, $search) !== false ||
                strpos($message, $search) !== false ||
                strpos($threatRisk, $search) !== false;

            if (!$searchFound) {
                continue;
            }
        }

        $filteredThreats[] = $threat;
    }

    /* NEWEST FIRST */
    usort($filteredThreats, function ($a, $b) {

        $dateA = strtotime(
            $a["created_at"] ?? $a["detected_at"] ?? ""
        ) ?: 0;

        $dateB = strtotime(
            $b["created_at"] ?? $b["detected_at"] ?? ""
        ) ?: 0;

        return $dateB <=> $dateA;
    });

    echo json_encode([
        "success" => true,
        "count" => count($filteredThreats),
        "threats" => $filteredThreats
    ]);

    exit;
}

/* UPDATE THREAT STATUS */
if ($method === "POST" && $action === "update") {

    $id = cleanText($_POST["id"] ?? "");
    $newStatus = strtolower(cleanText($_POST["status"] ?? ""));

    if ($id === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Threat ID is required."
        ]);
        exit;
    }

    $allowedStatuses = [
        "open",
        "investigating",
        "resolved",
        "closed"
    ];

    if (!in_array($newStatus, $allowedStatuses, true)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid threat status."
        ]);
        exit;
    }

    $found = false;

    foreach ($threats as &$threat) {

        if (
            is_array($threat) &&
            (string) ($threat["id"] ?? "") === $id
        ) {
            $threat["status"] = $newStatus;
            $threat["updated_at"] = date("Y-m-d H:i:s");
            $found = true;
            break;
        }
    }

    unset($threat);

    if (!$found) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Threat record not found."
        ]);
        exit;
    }

    if (!saveThreats($dataFile, $threats)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to save threat status."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Threat status updated successfully."
    ]);
    exit;
}

/* DELETE THREAT */
if ($method === "POST" && $action === "delete") {

    $id = cleanText($_POST["id"] ?? "");

    if ($id === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Threat ID is required."
        ]);
        exit;
    }

    $newThreats = [];
    $found = false;

    foreach ($threats as $threat) {

        if (
            is_array($threat) &&
            (string) ($threat["id"] ?? "") === $id
        ) {
            $found = true;
            continue;
        }

        $newThreats[] = $threat;
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Threat record not found."
        ]);
        exit;
    }

    if (!saveThreats($dataFile, $newThreats)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to delete threat record."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Threat record deleted successfully."
    ]);
    exit;
}

/* UNSUPPORTED ACTION */
http_response_code(400);

echo json_encode([
    "success" => false,
    "message" => "Invalid threat management action."
]);

exit;
?>