<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";


/* =========================================================
   CHECK LOGIN
========================================================= */

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Please login before using threat detection."
    ]);

    exit;
}


/* =========================================================
   GET URL
========================================================= */

$url = trim($_POST["url"] ?? "");

if ($url === "") {

    echo json_encode([
        "success" => false,
        "message" => "URL is required."
    ]);

    exit;
}


if (strlen($url) > 2048) {

    echo json_encode([
        "success" => false,
        "message" => "URL is too long."
    ]);

    exit;
}


if (!filter_var($url, FILTER_VALIDATE_URL)) {

    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid URL."
    ]);

    exit;
}


/* =========================================================
   PARSE URL
========================================================= */

$parsed = parse_url($url);

if (!$parsed || empty($parsed["host"])) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to determine the URL domain."
    ]);

    exit;
}


$host = strtolower($parsed["host"]);
$scheme = strtolower($parsed["scheme"] ?? "");

$score = 0;
$indicators = [];


/* =========================================================
   HTTPS CHECK
========================================================= */

if ($scheme !== "https") {

    $score += 15;

    $indicators[] =
        "The URL does not use HTTPS.";
}


/* =========================================================
   IP ADDRESS CHECK
========================================================= */

if (filter_var($host, FILTER_VALIDATE_IP)) {

    $score += 20;

    $indicators[] =
        "The URL uses an IP address instead of a domain name.";
}


/* =========================================================
   @ CHECK
========================================================= */

if (strpos($url, "@") !== false) {

    $score += 25;

    $indicators[] =
        "The URL contains an @ character, which can obscure the actual destination.";
}


/* =========================================================
   PUNYCODE CHECK
========================================================= */

if (strpos($host, "xn--") !== false) {

    $score += 25;

    $indicators[] =
        "The domain contains Punycode.";
}


/* =========================================================
   EXCESSIVE SUBDOMAINS
========================================================= */

$hostParts = explode(".", $host);

if (count($hostParts) >= 5) {

    $score += 15;

    $indicators[] =
        "The domain contains an unusually large number of subdomains.";
}


/* =========================================================
   SUSPICIOUS KEYWORDS
========================================================= */

$suspiciousKeywords = [
    "login",
    "verify",
    "verification",
    "secure",
    "account",
    "password",
    "update",
    "confirm",
    "wallet",
    "payment",
    "signin",
    "banking"
];

$lowerURL = strtolower($url);

$keywordMatches = 0;

foreach ($suspiciousKeywords as $keyword) {

    if (strpos($lowerURL, $keyword) !== false) {

        $keywordMatches++;

    }
}

if ($keywordMatches >= 3) {

    $score += 20;

    $indicators[] =
        "The URL contains several security-sensitive keywords.";

} elseif ($keywordMatches >= 1) {

    $score += 5;

    $indicators[] =
        "The URL contains a security-sensitive keyword.";
}


/* =========================================================
   URL LENGTH
========================================================= */

if (strlen($url) > 150) {

    $score += 10;

    $indicators[] =
        "The URL is unusually long.";
}


/* =========================================================
   ENCODED CHARACTERS
========================================================= */

$encodedCount = substr_count($url, "%");

if ($encodedCount >= 5) {

    $score += 15;

    $indicators[] =
        "The URL contains many encoded characters.";
}


/* =========================================================
   SUSPICIOUS FILE EXTENSIONS
========================================================= */

$suspiciousExtensions = [
    ".exe",
    ".scr",
    ".bat",
    ".cmd",
    ".msi",
    ".js"
];

foreach ($suspiciousExtensions as $extension) {

    if (stripos($url, $extension) !== false) {

        $score += 25;

        $indicators[] =
            "The URL references a potentially executable file type.";

        break;
    }
}


/* =========================================================
   SUSPICIOUS TLD
========================================================= */

$suspiciousTLDs = [
    ".zip",
    ".mov",
    ".click",
    ".top",
    ".xyz"
];

foreach ($suspiciousTLDs as $tld) {

    if (str_ends_with($host, $tld)) {

        $score += 10;

        $indicators[] =
            "The domain uses a TLD that may require additional scrutiny.";

        break;
    }
}


/* =========================================================
   LIMIT SCORE
========================================================= */

$score = min($score, 100);


/* =========================================================
   RISK CLASSIFICATION
========================================================= */

if ($score >= 75) {

    $risk = "Critical";

    $message =
        "Several strong suspicious indicators were detected.";

} elseif ($score >= 50) {

    $risk = "High";

    $message =
        "Multiple suspicious characteristics were detected.";

} elseif ($score >= 25) {

    $risk = "Medium";

    $message =
        "Some characteristics require additional attention.";

} else {

    $risk = "Low";

    $message =
        "No major suspicious indicators were detected.";
}


/* =========================================================
   CONVERT INDICATORS TO JSON
========================================================= */

$indicatorsJson = json_encode(
    $indicators,
    JSON_UNESCAPED_SLASHES
);

if ($indicatorsJson === false) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to process threat indicators."
    ]);

    exit;
}


/* =========================================================
   SAVE THREAT TO MYSQL
========================================================= */

$stmt = $conn->prepare("
    INSERT INTO threats
    (
        user_id,
        type,
        target,
        risk_level,
        risk_score,
        indicators,
        status,
        detected_at,
        updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
");


if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "SQL prepare error: " . $conn->error
    ]);

    exit;
}


$type = "URL Analysis";
$status = "Detected";


$stmt->bind_param(
    "isssiss",
    $_SESSION["user_id"],
    $type,
    $url,
    $risk,
    $score,
    $indicatorsJson,
    $status
);


/* =========================================================
   EXECUTE
========================================================= */

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to save threat analysis: " . $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}


/* =========================================================
   RESPONSE
========================================================= */

echo json_encode([

    "success" => true,

    "risk_level" => $risk,

    "score" => $score,

    "message" => $message,

    "indicators" => $indicators

]);


$stmt->close();
$conn->close();

?>