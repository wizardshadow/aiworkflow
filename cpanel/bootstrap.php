<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

const CPANEL_CONTENT_PATH = __DIR__ . '/../content.json';
const CPANEL_CONFIG_PATH = __DIR__ . '/config.local.php';

function cpanel_config(): array {
  static $cfg = null;
  if ($cfg !== null) return $cfg;

  $envUser = getenv('CPANEL_USERNAME') ?: getenv('ADMIN_USERNAME');
  $envPass = getenv('CPANEL_PASSWORD') ?: getenv('ADMIN_PASSWORD');
  $envSecret = getenv('CPANEL_SESSION_SECRET') ?: getenv('ADMIN_SESSION_SECRET');

  $file = [];
  if (is_file(CPANEL_CONFIG_PATH)) {
    $loaded = require CPANEL_CONFIG_PATH;
    if (is_array($loaded)) $file = $loaded;
  }

  $cfg = [
    'username' => (string)($envUser ?: ($file['username'] ?? 'admin')),
    'password_hash' => (string)($file['password_hash'] ?? ''),
    'password_plain' => (string)($envPass ?: ''),
    'session_secret' => (string)($envSecret ?: ($file['session_secret'] ?? '')),
  ];
  return $cfg;
}

function cpanel_start_session(): void {
  $cfg = cpanel_config();
  $name = 'aw_cpanel';
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name($name);
    session_set_cookie_params([
      'lifetime' => 60 * 60 * 12,
      'path' => '/cpanel',
      'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
      'httponly' => true,
      'samesite' => 'Lax',
    ]);
    session_start();
  }
  if (empty($_SESSION['_aw_secret_ok'])) {
    if ($cfg['session_secret'] === '') {
      // still allow login; bind session after auth
      $_SESSION['_aw_secret_ok'] = true;
    } else {
      $_SESSION['_aw_secret_ok'] = true;
      $_SESSION['_aw_bound'] = hash_hmac('sha256', session_id(), $cfg['session_secret']);
    }
  }
}

function cpanel_json(array $payload, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function cpanel_is_authed(): bool {
  cpanel_start_session();
  if (empty($_SESSION['aw_authed'])) return false;
  $cfg = cpanel_config();
  if ($cfg['session_secret'] !== '' && !empty($_SESSION['_aw_bound'])) {
    $expect = hash_hmac('sha256', session_id(), $cfg['session_secret']);
    if (!hash_equals($expect, (string)$_SESSION['_aw_bound'])) {
      return false;
    }
  }
  return true;
}

function cpanel_require_auth(): void {
  if (!cpanel_is_authed()) {
    cpanel_json(['ok' => false, 'error' => 'unauthorized'], 401);
  }
}

function cpanel_verify_password(string $username, string $password): bool {
  $cfg = cpanel_config();
  if (!hash_equals($cfg['username'], $username)) return false;

  if ($cfg['password_plain'] !== '') {
    return hash_equals($cfg['password_plain'], $password);
  }
  if ($cfg['password_hash'] !== '') {
    return password_verify($password, $cfg['password_hash']);
  }
  return false;
}

function cpanel_login(string $username, string $password): bool {
  if (!cpanel_verify_password($username, $password)) return false;
  cpanel_start_session();
  session_regenerate_id(true);
  $_SESSION['aw_authed'] = true;
  $_SESSION['aw_user'] = $username;
  $cfg = cpanel_config();
  if ($cfg['session_secret'] !== '') {
    $_SESSION['_aw_bound'] = hash_hmac('sha256', session_id(), $cfg['session_secret']);
  }
  return true;
}

function cpanel_logout(): void {
  cpanel_start_session();
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', (bool)$p['secure'], (bool)$p['httponly']);
  }
  session_destroy();
}

function cpanel_read_content(): array {
  if (!is_file(CPANEL_CONTENT_PATH)) {
    return [];
  }
  $raw = file_get_contents(CPANEL_CONTENT_PATH);
  if ($raw === false || $raw === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function cpanel_write_content(array $data): void {
  $data['updatedAt'] = gmdate('c');
  if (!isset($data['version'])) $data['version'] = 1;
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
  if ($json === false) {
    throw new RuntimeException('Не удалось сериализовать JSON');
  }
  $tmp = CPANEL_CONTENT_PATH . '.tmp';
  if (file_put_contents($tmp, $json . "\n", LOCK_EX) === false) {
    throw new RuntimeException('Не удалось записать временный файл');
  }
  if (!rename($tmp, CPANEL_CONTENT_PATH)) {
    @unlink($tmp);
    throw new RuntimeException('Не удалось сохранить content.json');
  }
}

function cpanel_csrf_token(): string {
  cpanel_start_session();
  if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
  }
  return (string)$_SESSION['csrf'];
}

function cpanel_check_csrf(?string $token): bool {
  cpanel_start_session();
  if (!$token || empty($_SESSION['csrf'])) return false;
  return hash_equals((string)$_SESSION['csrf'], $token);
}
