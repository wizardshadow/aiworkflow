<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

cpanel_start_session();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($method === 'GET' && ($action === 'me' || $action === '')) {
  cpanel_json([
    'ok' => true,
    'authed' => cpanel_is_authed(),
    'user' => $_SESSION['aw_user'] ?? null,
    'csrf' => cpanel_csrf_token(),
    'configured' => cpanel_config()['password_hash'] !== '' || cpanel_config()['password_plain'] !== '',
  ]);
}

if ($method === 'GET' && $action === 'content') {
  cpanel_require_auth();
  cpanel_json([
    'ok' => true,
    'content' => cpanel_read_content(),
    'csrf' => cpanel_csrf_token(),
  ]);
}

if ($method === 'POST' && $action === 'login') {
  $body = json_decode(file_get_contents('php://input') ?: '{}', true);
  if (!is_array($body)) $body = $_POST;
  $user = trim((string)($body['username'] ?? ''));
  $pass = (string)($body['password'] ?? '');
  $csrf = (string)($body['csrf'] ?? '');
  if (!cpanel_check_csrf($csrf)) {
    cpanel_json(['ok' => false, 'error' => 'csrf'], 400);
  }
  if (!cpanel_login($user, $pass)) {
    usleep(250000);
    cpanel_json(['ok' => false, 'error' => 'bad_credentials'], 401);
  }
  cpanel_json([
    'ok' => true,
    'user' => $user,
    'csrf' => cpanel_csrf_token(),
  ]);
}

if ($method === 'POST' && $action === 'logout') {
  $body = json_decode(file_get_contents('php://input') ?: '{}', true);
  if (!is_array($body)) $body = $_POST;
  $csrf = (string)($body['csrf'] ?? '');
  if (!cpanel_check_csrf($csrf)) {
    cpanel_json(['ok' => false, 'error' => 'csrf'], 400);
  }
  cpanel_logout();
  cpanel_json(['ok' => true]);
}

if ($method === 'POST' && $action === 'save') {
  cpanel_require_auth();
  $body = json_decode(file_get_contents('php://input') ?: '{}', true);
  if (!is_array($body)) {
    cpanel_json(['ok' => false, 'error' => 'bad_json'], 400);
  }
  $csrf = (string)($body['csrf'] ?? '');
  if (!cpanel_check_csrf($csrf)) {
    cpanel_json(['ok' => false, 'error' => 'csrf'], 400);
  }
  $content = $body['content'] ?? null;
  if (!is_array($content)) {
    cpanel_json(['ok' => false, 'error' => 'missing_content'], 400);
  }
  try {
    cpanel_write_content($content);
  } catch (Throwable $e) {
    cpanel_json(['ok' => false, 'error' => $e->getMessage()], 500);
  }
  cpanel_json([
    'ok' => true,
    'content' => cpanel_read_content(),
    'csrf' => cpanel_csrf_token(),
  ]);
}

cpanel_json(['ok' => false, 'error' => 'not_found'], 404);
