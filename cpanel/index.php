<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
cpanel_start_session();
$csrf = cpanel_csrf_token();
$authed = cpanel_is_authed() ? 'true' : 'false';
$user = htmlspecialchars((string)($_SESSION['aw_user'] ?? ''), ENT_QUOTES, 'UTF-8');
?><!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI WORKFLOW — панель контента</title>
  <meta name="robots" content="noindex,nofollow" />
  <link rel="stylesheet" href="cpanel.css" />
</head>
<body>
  <div id="loginView" class="login-wrap<?= $authed === 'true' ? ' hidden' : '' ?>">
    <form class="login-card" id="loginForm">
      <h1>AI WORKFLOW</h1>
      <p>Панель контента лендинга. Вход только для администратора.</p>
      <div class="field">
        <label for="username">Логин</label>
        <input id="username" name="username" type="text" autocomplete="username" required />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
      </div>
      <button class="btn btn-accent" type="submit">Войти</button>
      <div class="msg error hidden" id="loginError"></div>
    </form>
  </div>

  <div id="appView" class="shell<?= $authed === 'true' ? '' : ' hidden' ?>">
    <header class="topbar">
      <a class="brand" href="/">AI WORKFLOW <span>↗</span></a>
      <div class="topbar-meta">
        <div>/cpanel · контент и media URL</div>
        <div id="userLabel"><?= $user !== '' ? 'Вы вошли как ' . $user : '' ?></div>
      </div>
    </header>

    <div class="toolbar">
      <div class="row-actions">
        <button class="btn btn-accent" type="button" id="saveBtn">Сохранить</button>
        <button class="btn btn-ghost" type="button" id="reloadBtn">Обновить</button>
        <a class="btn btn-ghost" href="/" target="_blank" rel="noopener">Открыть сайт</a>
      </div>
      <div class="row-actions">
        <span class="msg" id="statusMsg"></span>
        <button class="btn btn-ghost" type="button" id="logoutBtn">Выйти</button>
      </div>
    </div>

    <div class="layout">
      <nav class="nav" id="sectionNav"></nav>
      <main class="panel card" id="editor"></main>
    </div>
  </div>

  <script>
  const state = {
    csrf: <?= json_encode($csrf, JSON_UNESCAPED_UNICODE) ?>,
    authed: <?= $authed ?>,
    content: null,
    section: 'media',
  };

  const SECTIONS = [
    { id: 'media', title: 'Медиа URL' },
    { id: 'hero', title: 'Hero' },
    { id: 'nav', title: 'Навигация' },
    { id: 'approach', title: 'Подход' },
    { id: 'market', title: 'Рынок' },
    { id: 'workflow', title: 'Workflow' },
    { id: 'program', title: 'Программа' },
    { id: 'proof', title: 'Результат' },
    { id: 'audience', title: 'Для кого' },
    { id: 'pricing', title: 'Стоимость' },
    { id: 'final', title: 'Финал' },
    { id: 'footer', title: 'Футер' },
    { id: 'enroll', title: 'Модалка записи' },
    { id: 'success', title: 'Success' },
  ];

  const $ = (sel) => document.querySelector(sel);

  function setStatus(text, kind) {
    const el = $('#statusMsg');
    el.textContent = text || '';
    el.className = 'msg' + (kind ? ' ' + kind : '');
  }

  async function api(action, opts = {}) {
    const method = opts.method || 'GET';
    const res = await fetch('api.php?action=' + encodeURIComponent(action), {
      method,
      credentials: 'same-origin',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify({ ...opts.body, csrf: state.csrf }) : undefined,
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'bad_response' }));
    if (data.csrf) state.csrf = data.csrf;
    if (!res.ok || data.ok === false) {
      const err = new Error(data.error || ('http_' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function field(label, path, multiline = false, type = 'text') {
    const value = getPath(state.content, path) ?? '';
    const id = 'f_' + path.replace(/[^a-zA-Z0-9]/g, '_');
    if (multiline) {
      return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-path="${path}">${escapeHtml(String(value))}</textarea></div>`;
    }
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-path="${path}" type="${type}" value="${escapeAttr(String(value))}" /></div>`;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/\n/g, ' ');
  }

  function getPath(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }
  function setPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
      const next = parts[i + 1];
      const nextIsIndex = /^\d+$/.test(next);
      if (cur[k] == null || typeof cur[k] !== 'object') {
        cur[k] = nextIsIndex ? [] : {};
      }
      cur = cur[k];
    }
    const last = parts[parts.length - 1];
    cur[/^\d+$/.test(last) ? Number(last) : last] = value;
  }

  function collectFields(root = document) {
    root.querySelectorAll('[data-path]').forEach((el) => {
      setPath(state.content, el.getAttribute('data-path'), el.value);
    });
  }

  function listTextarea(label, path, hint) {
    const arr = getPath(state.content, path) || [];
    const id = 'list_' + path.replace(/[^a-zA-Z0-9]/g, '_');
    return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-list-path="${path}">${escapeHtml(arr.join('\n'))}</textarea><div class="hint">${hint || 'Каждая строка — отдельный пункт.'}</div></div>`;
  }

  function collectLists(root = document) {
    root.querySelectorAll('[data-list-path]').forEach((el) => {
      const lines = el.value.split('\n').map((s) => s.trimEnd());
      // keep empty trailing lines out, but preserve intentional blanks only if mid-list? strip empties
      const items = lines.map((s) => s.trim()).filter((s) => s.length > 0);
      setPath(state.content, el.getAttribute('data-list-path'), items);
    });
  }

  function renderNav() {
    $('#sectionNav').innerHTML = SECTIONS.map((s) =>
      `<button type="button" data-section="${s.id}" class="${state.section === s.id ? 'active' : ''}">${s.title}</button>`
    ).join('');
    $('#sectionNav').onclick = (e) => {
      const btn = e.target.closest('[data-section]');
      if (!btn) return;
      collectFields();
      collectLists();
      collectProgram();
      collectStats();
      collectSteps();
      collectValueStack();
      collectProofStats();
      collectNavItems();
      state.section = btn.getAttribute('data-section');
      render();
    };
  }

  function collectNavItems() {
    const labels = [...document.querySelectorAll('[data-nav-label]')];
    if (!labels.length) return;
    state.content.nav = labels.map((el) => ({
      id: el.getAttribute('data-nav-id'),
      label: el.value,
    }));
    const cta = document.querySelector('[data-path="headerCta"]');
    if (cta) state.content.headerCta = cta.value;
  }

  function collectStats() {
    const rows = [...document.querySelectorAll('[data-stat-index]')];
    if (!rows.length) return;
    const byIndex = {};
    rows.forEach((el) => {
      const i = el.getAttribute('data-stat-index');
      const key = el.getAttribute('data-stat-key');
      byIndex[i] = byIndex[i] || {};
      byIndex[i][key] = el.value;
    });
    state.content.market.stats = Object.keys(byIndex).sort((a,b)=>a-b).map((i) => byIndex[i]);
  }

  function collectSteps() {
    const rows = [...document.querySelectorAll('[data-step-index]')];
    if (!rows.length) return;
    const byIndex = {};
    rows.forEach((el) => {
      const i = el.getAttribute('data-step-index');
      const key = el.getAttribute('data-step-key');
      byIndex[i] = byIndex[i] || {};
      byIndex[i][key] = el.value;
    });
    state.content.workflow.steps = Object.keys(byIndex).sort((a,b)=>a-b).map((i) => byIndex[i]);
  }

  function collectValueStack() {
    const rows = [...document.querySelectorAll('[data-value-index]')];
    if (!rows.length) return;
    const byIndex = {};
    rows.forEach((el) => {
      const i = el.getAttribute('data-value-index');
      const key = el.getAttribute('data-value-key');
      byIndex[i] = byIndex[i] || {};
      if (el.type === 'checkbox') byIndex[i][key] = el.checked;
      else byIndex[i][key] = el.value;
    });
    state.content.pricing.valueStack = Object.keys(byIndex).sort((a,b)=>a-b).map((i) => byIndex[i]);
  }

  function collectProofStats() {
    const rows = [...document.querySelectorAll('[data-pstat-index]')];
    if (!rows.length) return;
    const byIndex = {};
    rows.forEach((el) => {
      const i = el.getAttribute('data-pstat-index');
      const key = el.getAttribute('data-pstat-key');
      byIndex[i] = byIndex[i] || {};
      byIndex[i][key] = el.value;
    });
    state.content.proof.stats = Object.keys(byIndex).sort((a,b)=>a-b).map((i) => byIndex[i]);
  }

  function collectProgram() {
    const mods = state.content.program?.modules || [];
    mods.forEach((mod, mi) => {
      const title = document.querySelector(`[data-mod="${mi}"][data-mod-key="title"]`);
      const month = document.querySelector(`[data-mod="${mi}"][data-mod-key="month"]`);
      const weeks = document.querySelector(`[data-mod="${mi}"][data-mod-key="weeks"]`);
      const imageUrl = document.querySelector(`[data-mod="${mi}"][data-mod-key="imageUrl"]`);
      if (title) mod.title = title.value;
      if (month) mod.month = month.value;
      if (weeks) mod.weeks = weeks.value;
      if (imageUrl) mod.imageUrl = imageUrl.value;
      (mod.rows || []).forEach((row, ri) => {
        ['week','topic','result'].forEach((key) => {
          const el = document.querySelector(`[data-mod-row="${mi}:${ri}"][data-row-key="${key}"]`);
          if (el) row[key] = el.value;
        });
      });
    });
  }

  function renderEditor() {
    const c = state.content;
    const el = $('#editor');
    let html = '';

    if (state.section === 'media') {
      html = `
        <h2>Медиа URL</h2>
        <p class="hint">Только ссылки. Upload файлов нет — положите файл на хост или CDN и вставьте URL.</p>
        ${field('Hero video URL', 'hero.videoUrl', false, 'url')}
        ${field('Market / поезд video URL', 'market.videoUrl', false, 'url')}
        ${field('Фото спикера', 'proof.imageUrl', false, 'url')}
        ${field('Модуль 1 — картинка', 'program.modules.0.imageUrl', false, 'url')}
        ${field('Модуль 2 — картинка', 'program.modules.1.imageUrl', false, 'url')}
        ${field('Модуль 3 — картинка', 'program.modules.2.imageUrl', false, 'url')}
      `;
    }

    if (state.section === 'hero') {
      html = `
        <h2>Hero</h2>
        <p class="hint">Переносы строк в полях с несколькими строками — через Enter.</p>
        <div class="grid-2">
          ${field('Кикер слева', 'hero.kickerLeft')}
          ${field('Кикер справа', 'hero.kickerRight')}
        </div>
        ${field('Оффер', 'hero.offer')}
        <div class="grid-2">
          ${field('Заголовок AI', 'hero.titleAi')}
          ${field('Заголовок остальное', 'hero.titleRest')}
        </div>
        ${field('Лид', 'hero.lead', true)}
        ${field('Длительность (акцент)', 'hero.duration')}
        ${field('CTA', 'hero.cta')}
        ${field('Места / старт', 'hero.availability')}
        ${field('Рассрочка', 'hero.installments')}
        <div class="grid-2">
          ${field('Визуал сверху слева', 'hero.visualTopLeft')}
          ${field('Визуал сверху справа', 'hero.visualTopRight')}
        </div>
        ${field('Визуал снизу', 'hero.visualBottom')}
        ${field('Статус — подпись', 'hero.statusLabel')}
        <div class="grid-2">
          ${field('Формат label', 'hero.formatLabel')}
          ${field('Формат value', 'hero.formatValue')}
          ${field('Старт label', 'hero.startLabel')}
          ${field('Старт value', 'hero.startValue')}
          ${field('Места label', 'hero.seatsLabel')}
          ${field('Места value', 'hero.seatsValue')}
        </div>
        ${field('Статус футер', 'hero.statusFooter', true)}
        ${field('Тикер', 'hero.ticker', true)}
      `;
    }

    if (state.section === 'nav') {
      html = `<h2>Навигация</h2><p class="hint">Подписи пунктов меню и CTA в шапке.</p>${field('CTA шапки', 'headerCta')}`;
      html += (c.nav || []).map((item, i) =>
        `<div class="field"><label>Пункт ${i + 1} (#${item.id})</label><input data-nav-label data-nav-id="${escapeAttr(item.id)}" type="text" value="${escapeAttr(item.label)}" /></div>`
      ).join('');
    }

    if (state.section === 'approach') {
      html = `
        <h2>Подход</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'approach.labelLeft')}
          ${field('Лейбл справа', 'approach.labelRight')}
        </div>
        ${field('Заголовок', 'approach.heading', true)}
        ${field('Подзаголовок', 'approach.sub', true)}
        <div class="block">
          <h3>Сценарий А</h3>
          ${field('Заголовок', 'approach.scenarioA.title', true)}
          ${field('Низ', 'approach.scenarioA.footer')}
          ${listTextarea('Пункты', 'approach.scenarioA.items')}
        </div>
        <div class="block">
          <h3>Сценарий Б</h3>
          ${field('Заголовок', 'approach.scenarioB.title', true)}
          ${field('Низ', 'approach.scenarioB.footer')}
          ${listTextarea('Пункты', 'approach.scenarioB.items')}
        </div>
      `;
    }

    if (state.section === 'market') {
      html = `
        <h2>Рынок</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'market.labelLeft')}
          ${field('Лейбл справа', 'market.labelRight')}
        </div>
        ${field('Заголовок', 'market.heading')}
        ${field('Заголовок muted', 'market.headingMuted')}
        ${field('Заголовок про поезд', 'market.trainHeading', true)}
        ${field('Абзац 1', 'market.p1', true)}
        ${field('Абзац 2', 'market.p2', true)}
        ${field('Манифест', 'market.manifesto')}
        ${field('Манифест акцент', 'market.manifestoAccent', true)}
        <div class="block"><h3>Статистика</h3>
        ${(c.market.stats || []).map((s, i) => `
          <div class="grid-2" style="margin-bottom:10px">
            <div class="field"><label>Значение %</label><input data-stat-index="${i}" data-stat-key="value" value="${escapeAttr(s.value)}" /></div>
            <div class="field"><label>Источник</label><input data-stat-index="${i}" data-stat-key="source" value="${escapeAttr(s.source)}" /></div>
            <div class="field" style="grid-column:1/-1"><label>Текст</label><textarea data-stat-index="${i}" data-stat-key="copy">${escapeHtml(s.copy)}</textarea></div>
          </div>`).join('')}
        </div>
      `;
    }

    if (state.section === 'workflow') {
      html = `
        <h2>Workflow</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'workflow.labelLeft')}
          ${field('Лейбл справа', 'workflow.labelRight')}
        </div>
        ${field('Заголовок', 'workflow.heading', true)}
        ${field('Заголовок акцент', 'workflow.headingAccent')}
        ${field('Абзац 1', 'workflow.p1', true)}
        ${field('Абзац 2', 'workflow.p2', true)}
        <div class="block"><h3>Шаги</h3>
        ${(c.workflow.steps || []).map((s, i) => `
          <div class="block">
            <div class="field"><label>Шаг ${i + 1} — название</label><input data-step-index="${i}" data-step-key="title" value="${escapeAttr(s.title)}" /></div>
            <div class="field"><label>ИИ</label><textarea data-step-index="${i}" data-step-key="ai">${escapeHtml(s.ai)}</textarea></div>
            <div class="field"><label>Твоя роль</label><textarea data-step-index="${i}" data-step-key="human">${escapeHtml(s.human)}</textarea></div>
          </div>`).join('')}
        </div>
        ${field('Футер заголовок', 'workflow.footerTitle')}
        ${field('Футер текст', 'workflow.footerBody', true)}
        ${field('Футер aside', 'workflow.footerAside', true)}
      `;
    }

    if (state.section === 'program') {
      html = `
        <h2>Программа</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'program.labelLeft')}
          ${field('Лейбл справа', 'program.labelRight')}
        </div>
        ${field('Заголовок', 'program.heading', true)}
        ${field('Заметка', 'program.note', true)}
        ${field('Низ — лейбл', 'program.endLabel')}
        ${field('CTA', 'program.cta')}
        ${(c.program.modules || []).map((mod, mi) => `
          <div class="block">
            <h3>Модуль ${mi + 1}</h3>
            <div class="grid-2">
              <div class="field"><label>Название</label><input data-mod="${mi}" data-mod-key="title" value="${escapeAttr(mod.title)}" /></div>
              <div class="field"><label>Месяц</label><input data-mod="${mi}" data-mod-key="month" value="${escapeAttr(mod.month)}" /></div>
              <div class="field"><label>Недели</label><input data-mod="${mi}" data-mod-key="weeks" value="${escapeAttr(mod.weeks)}" /></div>
              <div class="field"><label>Картинка URL</label><input data-mod="${mi}" data-mod-key="imageUrl" value="${escapeAttr(mod.imageUrl)}" /></div>
            </div>
            ${(mod.rows || []).map((row, ri) => `
              <div class="block">
                <div class="field"><label>Неделя</label><input data-mod-row="${mi}:${ri}" data-row-key="week" value="${escapeAttr(row.week)}" /></div>
                <div class="field"><label>Тема</label><textarea data-mod-row="${mi}:${ri}" data-row-key="topic">${escapeHtml(row.topic)}</textarea></div>
                <div class="field"><label>Результат</label><textarea data-mod-row="${mi}:${ri}" data-row-key="result">${escapeHtml(row.result)}</textarea></div>
              </div>`).join('')}
          </div>`).join('')}
      `;
    }

    if (state.section === 'proof') {
      html = `
        <h2>Результат / proof</h2>
        ${field('Лейбл', 'proof.labelLeft')}
        ${field('Заголовок', 'proof.heading', true)}
        ${field('Фото URL', 'proof.imageUrl', false, 'url')}
        ${field('Alt фото', 'proof.imageAlt')}
        ${field('Цитата', 'proof.quote', true)}
        ${field('Автор', 'proof.author')}
        ${field('CTA', 'proof.cta')}
        <div class="block"><h3>Метрики</h3>
        ${(c.proof.stats || []).map((s, i) => `
          <div class="grid-2" style="margin-bottom:10px">
            <div class="field"><label>A</label><input data-pstat-index="${i}" data-pstat-key="a" value="${escapeAttr(s.a)}" /></div>
            <div class="field"><label>B</label><input data-pstat-index="${i}" data-pstat-key="b" value="${escapeAttr(s.b)}" /></div>
            <div class="field"><label>C</label><input data-pstat-index="${i}" data-pstat-key="c" value="${escapeAttr(s.c)}" /></div>
            <div class="field"><label>Подпись</label><input data-pstat-index="${i}" data-pstat-key="label" value="${escapeAttr(s.label)}" /></div>
          </div>`).join('')}
        </div>
      `;
    }

    if (state.section === 'audience') {
      html = `
        <h2>Для кого</h2>
        ${field('Лейбл', 'audience.labelLeft')}
        ${field('Заголовок', 'audience.heading', true)}
        ${field('Подзаголовок', 'audience.sub')}
        ${field('Заголовок «подойдёт»', 'audience.fitTitle')}
        ${listTextarea('Подойдёт', 'audience.fit')}
        ${field('Заголовок «не подойдёт»', 'audience.notFitTitle')}
        ${listTextarea('Не подойдёт', 'audience.notFit')}
      `;
    }

    if (state.section === 'pricing') {
      html = `
        <h2>Стоимость</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'pricing.labelLeft')}
          ${field('Лейбл справа', 'pricing.labelRight')}
        </div>
        ${field('Intro заголовок', 'pricing.introHeading', true)}
        ${field('Intro ценность', 'pricing.introValue')}
        ${field('Итого label', 'pricing.valueTotalLabel')}
        ${field('Итого value', 'pricing.valueTotal')}
        <div class="block"><h3>Стек ценности</h3>
        ${(c.pricing.valueStack || []).map((row, i) => `
          <div class="grid-2" style="margin-bottom:10px">
            <div class="field" style="grid-column:1/-1"><label>Пункт</label><textarea data-value-index="${i}" data-value-key="item">${escapeHtml(row.item)}</textarea></div>
            <div class="field"><label>Цена</label><input data-value-index="${i}" data-value-key="price" value="${escapeAttr(row.price)}" /></div>
            <div class="field"><label><input type="checkbox" data-value-index="${i}" data-value-key="priceless" ${row.priceless ? 'checked' : ''}/> Бесценно (стиль)</label></div>
          </div>`).join('')}
        </div>
        ${field('Оффер label', 'pricing.offerLabel')}
        <div class="grid-2">
          ${field('Цена', 'pricing.price')}
          ${field('Старая цена', 'pricing.priceOld')}
        </div>
        ${field('Скидка до', 'pricing.discountNote')}
        ${field('Рассрочка', 'pricing.installments')}
        ${field('CTA', 'pricing.cta')}
        ${field('Места', 'pricing.availability')}
        ${field('Дедлайн', 'pricing.deadline')}
      `;
    }

    if (state.section === 'final') {
      html = `
        <h2>Финал</h2>
        <div class="grid-2">
          ${field('Лейбл слева', 'final.labelLeft')}
          ${field('Лейбл справа', 'final.labelRight')}
        </div>
        ${field('Заголовок', 'final.heading', true)}
        ${field('Абзац', 'final.p1', true)}
        ${field('Акцент', 'final.accent', true)}
        ${field('CTA', 'final.cta')}
        ${field('Места', 'final.availability')}
      `;
    }

    if (state.section === 'footer') {
      html = `
        <h2>Футер</h2>
        ${field('Тэглайн', 'footer.tagline', true)}
        ${field('Юр. строка', 'footer.legal', true)}
        ${field('Оферта', 'footer.offerLabel')}
        ${field('Политика', 'footer.privacyLabel')}
        ${field('Наверх', 'footer.topLabel')}
      `;
    }

    if (state.section === 'enroll') {
      html = `
        <h2>Модалка записи</h2>
        ${field('Лейбл', 'enroll.label')}
        ${field('Заголовок', 'enroll.title')}
        ${field('Заметка', 'enroll.note')}
      `;
    }

    if (state.section === 'success') {
      html = `
        <h2>Страница success</h2>
        ${field('Заголовок', 'success.title')}
        ${field('Лид', 'success.lead')}
        ${field('Текст', 'success.body', true)}
        ${field('Старт', 'success.start')}
        ${field('Кнопка', 'success.loginLabel')}
        ${field('URL входа', 'success.loginUrl', false, 'url')}
      `;
    }

    el.innerHTML = html;
  }

  function render() {
    renderNav();
    renderEditor();
  }

  async function loadContent() {
    setStatus('Загрузка…');
    const data = await api('content');
    state.content = data.content;
    setStatus('Загружено', 'ok');
    render();
  }

  async function saveContent() {
    collectFields();
    collectLists();
    collectProgram();
    collectStats();
    collectSteps();
    collectValueStack();
    collectProofStats();
    collectNavItems();
    setStatus('Сохранение…');
    $('#saveBtn').disabled = true;
    try {
      const data = await api('save', { method: 'POST', body: { content: state.content } });
      state.content = data.content;
      setStatus('Сохранено · сайт подхватит после обновления', 'ok');
    } catch (e) {
      setStatus('Ошибка: ' + e.message, 'error');
    } finally {
      $('#saveBtn').disabled = false;
    }
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#loginError');
    err.classList.add('hidden');
    try {
      const data = await api('login', {
        method: 'POST',
        body: {
          username: $('#username').value.trim(),
          password: $('#password').value,
        },
      });
      state.authed = true;
      $('#userLabel').textContent = 'Вы вошли как ' + (data.user || 'admin');
      $('#loginView').classList.add('hidden');
      $('#appView').classList.remove('hidden');
      await loadContent();
    } catch (ex) {
      err.textContent = ex.message === 'bad_credentials' ? 'Неверный логин или пароль' : ('Ошибка: ' + ex.message);
      err.classList.remove('hidden');
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try { await api('logout', { method: 'POST', body: {} }); } catch (_) {}
    location.reload();
  });
  $('#saveBtn').addEventListener('click', saveContent);
  $('#reloadBtn').addEventListener('click', () => loadContent().catch((e) => setStatus(e.message, 'error')));

  (async () => {
    try {
      const me = await api('me');
      state.authed = !!me.authed;
      if (!me.configured) {
        const err = $('#loginError');
        err.textContent = 'Пароль не настроен: загрузите cpanel/config.local.php на сервер.';
        err.classList.remove('hidden');
      }
      if (state.authed) {
        $('#loginView').classList.add('hidden');
        $('#appView').classList.remove('hidden');
        await loadContent();
      }
    } catch (e) {
      console.error(e);
    }
  })();
  </script>
</body>
</html>
