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
   GET INPUT
========================================================= */

$input = trim($_POST["lookup"] ?? "");

if ($input === "") {

    echo json_encode([
        "success" => false,
        "message" => "IP address or domain is required."
    ]);

    exit;
}


if (strlen($input) > 253) {

    echo json_encode([
        "success" => false,
        "message" => "Input is too long."
    ]);

    exit;
}


/* =========================================================
   REMOVE PROTOCOL / PATH
========================================================= */

$input = preg_replace(
    "/^https?:\/\//i",
    "",
    $input
);

$input = explode("/", $input)[0];
$input = explode("?", $input)[0];
$input = explode("#", $input)[0];
$input = trim($input);


/* =========================================================
   DETERMINE IP OR DOMAIN
========================================================= */

$isIPv4 = filter_var(
    $input,
    FILTER_VALIDATE_IP,
    FILTER_FLAG_IPV4
);

$isIPv6 = filter_var(
    $input,
    FILTER_VALIDATE_IP,
    FILTER_FLAG_IPV6
);

$isIP = ($isIPv4 !== false || $isIPv6 !== false);


/* =========================================================
   IP LOOKUP
========================================================= */

if ($isIP) {

    $ip = $input;

    $type = $isIPv4 ? "IPv4" : "IPv6";

    $hostname = gethostbyaddr($ip);

    if ($hostname === false) {
        $hostname = "No reverse DNS record";
    }

    $records = [

        [
            "label" => "Input",
            "value" => $input
        ],

        [
            "label" => "Type",
            "value" => $type
        ],

        [
            "label" => "Reverse DNS",
            "value" => $hostname
        ]

    ];

    $risk = "Low";

    $riskScore = 0;

    $message =
        "The IP address was processed successfully. " .
        "This lookup does not confirm whether an IP is malicious.";

}


/* =========================================================
   DOMAIN LOOKUP
========================================================= */

else {

    if (
        !preg_match(
            '/^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/',
            $input
        )
    ) {

        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid domain name."
        ]);

        exit;
    }


    $domain = strtolower($input);

    $ip = gethostbyname($domain);

    if ($ip === $domain) {

        echo json_encode([
            "success" => false,
            "message" => "The domain could not be resolved."
        ]);

        exit;
    }


    $records = [

        [
            "label" => "Domain",
            "value" => $domain
        ],

        [
            "label" => "Resolved IPv4",
            "value" => $ip
        ]

    ];


    /* =====================================================
       DNS RECORDS
    ===================================================== */

    $dnsRecords = dns_get_record(
        $domain,
        DNS_A | DNS_AAAA | DNS_CNAME
    );


    if ($dnsRecords !== false) {

        foreach ($dnsRecords as $record) {

            if (
                isset($record["type"]) &&
                isset($record["target"])
            ) {

                $records[] = [

                    "label" => $record["type"],
                    "value" => $record["target"]

                ];

            }

            elseif (
                isset($record["type"]) &&
                isset($record["ip"])
            ) {

                $records[] = [

                    "label" => $record["type"],
                    "value" => $record["ip"]

                ];

            }

        }

    }


    $risk = "Low";

    $riskScore = 0;

    $message =
        "The domain resolved successfully. " .
        "DNS resolution alone does not establish that a domain is safe.";
}


/* =========================================================
   SAVE LOOKUP TO MYSQL
========================================================= */

$type = "IP / Domain Lookup";

$indicators = json_encode(
    $records,
    JSON_UNESCAPED_SLASHES
);

$status = "Detected";


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


$stmt->bind_param(
    "isssiss",
    $_SESSION["user_id"],
    $type,
    $input,
    $risk,
    $riskScore,
    $indicators,
    $status
);


if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to save lookup result: " . $stmt->error
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

    "message" => $message,

    "records" => $records

]);


$stmt->close();
$conn->close();

?>