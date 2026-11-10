<?php
/**
 * Скопируй в config.local.php на сервере (не коммитить).
 * Пароль задаётся хешем: php -r "echo password_hash('ВАШ_ПАРОЛЬ', PASSWORD_DEFAULT), PHP_EOL;"
 */
return [
  'username' => 'admin',
  // Замени на password_hash(...) своего пароля
  'password_hash' => '',
  // Случайная строка для подписи сессии
  'session_secret' => 'change-me-to-a-long-random-string',
];
