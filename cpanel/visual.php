<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
cpanel_start_session();

if (!cpanel_is_authed()) {
  header('Location: ./', true, 302);
  exit;
}

$csrf = cpanel_csrf_token();
$user = htmlspecialchars((string)($_SESSION['aw_user'] ?? 'admin'), ENT_QUOTES, 'UTF-8');
?><!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI WORKFLOW — визуальный редактор</title>
  <meta name="robots" content="noindex,nofollow" />
  <link rel="stylesheet" href="visual.css" />
</head>
<body>
  <header class="ve-top">
    <div class="ve-top-inner">
      <a class="ve-brand" href="/">AI WORKFLOW <span>↗</span></a>
      <div class="ve-actions">
        <span class="ve-status" id="statusMsg">Загрузка…</span>
        <button class="ve-btn ve-btn-accent" type="button" id="saveAllBtn">Сохранить</button>
        <a class="ve-btn" href="./">Формы</a>
        <a class="ve-btn" href="/" target="_blank" rel="noopener">Сайт</a>
        <button class="ve-btn" type="button" id="logoutBtn">Выйти</button>
      </div>
    </div>
  </header>

  <main class="ve-shell">
    <div class="ve-intro">
      <h1>Визуальный редактор</h1>
      <p>
        Наведите на блок — появится карандаш. Правьте тексты и media URL прямо в макете,
        затем сохраните в <code>content.json</code>. Вошли как <?= $user ?>.
      </p>
    </div>
    <div class="ve-stack" id="blocks"></div>
  </main>

  <script>
  const state = {
    csrf: <?= json_encode($csrf, JSON_UNESCAPED_UNICODE) ?>,
    content: null,
    editing: null,
  };

  const PENCIL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>`;

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/\n/g, ' ');
  }
  function nl(s) {
    return escapeHtml(s).replace(/\n/g, '<br/>');
  }
  function getPath(obj, path) {
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      const k = /^\d+$/.test(key) ? Number(key) : key;
      return acc[k];
    }, obj);
  }
  function setPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const raw = parts[i];
      const k = /^\d+$/.test(raw) ? Number(raw) : raw;
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
    if (res.status === 401) {
      location.href = './';
      throw new Error('unauthorized');
    }
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || ('http_' + res.status));
    }
    return data;
  }

  function setStatus(text, kind) {
    const el = document.getElementById('statusMsg');
    el.textContent = text || '';
    el.className = 've-status' + (kind ? ' ' + kind : '');
  }

  function field(label, path, multiline = false, type = 'text') {
    const value = getPath(state.content, path) ?? '';
    if (multiline) {
      return `<div class="ve-field"><label>${escapeHtml(label)}</label><textarea data-path="${escapeAttr(path)}">${escapeHtml(String(value))}</textarea></div>`;
    }
    return `<div class="ve-field"><label>${escapeHtml(label)}</label><input data-path="${escapeAttr(path)}" type="${type}" value="${escapeAttr(String(value))}" /></div>`;
  }

  function listField(label, path) {
    const arr = getPath(state.content, path) || [];
    return `<div class="ve-field"><label>${escapeHtml(label)} <span style="text-transform:none;letter-spacing:0">(по строке)</span></label><textarea data-list-path="${escapeAttr(path)}">${escapeHtml(arr.join('\n'))}</textarea></div>`;
  }

  function collectFrom(root) {
    root.querySelectorAll('[data-path]').forEach((el) => {
      const path = el.getAttribute('data-path');
      let value = el.value;
      if (path === 'seats.remaining' || path === 'seats.total') {
        const n = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
        value = Number.isFinite(n) ? n : 0;
      }
      setPath(state.content, path, value);
    });
    root.querySelectorAll('[data-list-path]').forEach((el) => {
      const items = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
      setPath(state.content, el.getAttribute('data-list-path'), items);
    });
  }

  function blockShell(id, label, title, previewHtml, editHtml) {
    return `
      <section class="ve-block" data-block="${id}" id="block-${id}">
        <div class="ve-block-head">
          <div>
            <div class="ve-block-label">${escapeHtml(label)}</div>
            <h2 class="ve-block-title">${escapeHtml(title)}</h2>
          </div>
          <button class="ve-pencil" type="button" data-edit="${id}" aria-label="Редактировать блок ${escapeAttr(title)}">${PENCIL}</button>
        </div>
        <div class="ve-preview">${previewHtml}</div>
        <div class="ve-edit">
          ${editHtml}
          <div class="ve-edit-actions">
            <button class="ve-btn ve-btn-accent" type="button" data-apply="${id}">Готово</button>
            <button class="ve-btn" type="button" data-cancel="${id}">Отмена</button>
            <p class="ve-hint">«Готово» применяет правки в черновик. «Сохранить» наверху пишет на сайт.</p>
          </div>
        </div>
      </section>`;
  }

  function render() {
    const c = state.content;
    const root = document.getElementById('blocks');
    const openId = state.editing;

    const seats = c.seats || { remaining: 0, total: 0 };
    const seatsLeft = `Осталось ${seats.remaining} мест из ${seats.total}`;

    const html = [
      blockShell('seats', 'Места', 'Единое поле мест', `
        <p class="ve-lead">${escapeHtml(seatsLeft)}</p>
        <p class="ve-meta">Всего в группе: ${escapeHtml(String(seats.total))} · подпись статуса: ${escapeHtml(c.hero.seatsLabel || '')}</p>
        <p class="ve-meta">Hero: ${escapeHtml(seatsLeft)}${c.hero.startNote ? ' · ' + escapeHtml(c.hero.startNote) : ''}</p>
        <p class="ve-meta">Final: ${c.final.startNote ? escapeHtml(c.final.startNote) + ' · ' : ''}${escapeHtml(seatsLeft)}</p>
      `, `
        ${field('Осталось', 'seats.remaining')}
        ${field('Всего в группе', 'seats.total')}
        ${field('Подпись «МЕСТ В ГРУППЕ»', 'hero.seatsLabel')}
        ${field('Hero — приписка после мест', 'hero.startNote')}
        ${field('Final — приписка перед местами', 'final.startNote')}
      `),

      blockShell('scripts', 'Скрипты', 'Внешние скрипты / аналитика', `
        <p class="ve-meta">Инъекция после window <code>load</code> + <code>requestIdleCallback</code> в конец body.</p>
        <pre style="white-space:pre-wrap;font-size:12px;margin:0;background:#fff;border:1px solid var(--line);padding:12px;">${escapeHtml(c.externalScriptsHtml || '(пусто)')}</pre>
      `, `
        ${field('HTML / script', 'externalScriptsHtml', true)}
        <p class="ve-hint">Доверенный код админа. Не синхронный head.</p>
      `),

      blockShell('hero', 'Hero', 'Первый экран', `
        <div class="ve-kicker"><span>${escapeHtml(c.hero.kickerLeft)}</span><span>${escapeHtml(c.hero.kickerRight)}</span></div>
        <div class="ve-chip">${escapeHtml(c.hero.offer)}</div>
        <p class="ve-lead"><strong>${escapeHtml(c.hero.titleAi)}</strong> ${escapeHtml(c.hero.titleRest)}</p>
        <p class="ve-lead">${escapeHtml(c.hero.lead)} <span style="color:var(--accent)">${escapeHtml(c.hero.duration)}</span></p>
        <div class="ve-chip">${escapeHtml(c.hero.cta)} ↗</div>
        <p class="ve-meta">${escapeHtml(seatsLeft)}${c.hero.startNote ? ' · ' + escapeHtml(c.hero.startNote) : ''} · ${escapeHtml(c.hero.installments)}</p>
        <div class="ve-media"><span>Video URL</span><code>${escapeHtml(c.hero.videoUrl)}</code></div>
      `, `
        ${field('Кикер слева', 'hero.kickerLeft')}
        ${field('Кикер справа', 'hero.kickerRight')}
        ${field('Оффер', 'hero.offer')}
        ${field('AI', 'hero.titleAi')}
        ${field('Заголовок', 'hero.titleRest')}
        ${field('Лид', 'hero.lead', true)}
        ${field('Длительность', 'hero.duration')}
        ${field('CTA', 'hero.cta')}
        ${field('Приписка старта', 'hero.startNote')}
        ${field('Рассрочка', 'hero.installments')}
        ${field('Video URL', 'hero.videoUrl', false, 'url')}
        ${field('Визуал сверху слева', 'hero.visualTopLeft')}
        ${field('Визуал сверху справа', 'hero.visualTopRight')}
        ${field('Визуал снизу', 'hero.visualBottom')}
        ${field('Тикер', 'hero.ticker', true)}
      `),

      blockShell('nav', 'Шапка', 'Навигация и CTA', `
        <div class="ve-chip">${escapeHtml(c.headerCta)} ↗</div>
        <div class="ve-kicker">${(c.nav || []).map((n) => `<span>${escapeHtml(n.label)}</span>`).join('')}</div>
      `, `
        ${field('CTA шапки', 'headerCta')}
        ${(c.nav || []).map((n, i) => field(`Пункт #${n.id}`, `nav.${i}.label`)).join('')}
      `),

      blockShell('approach', '01', 'Точка выбора', `
        <p class="ve-lead">${nl(c.approach.heading)}</p>
        <p class="ve-meta">${nl(c.approach.sub)}</p>
        <div class="ve-grid">
          <div class="ve-card">
            <h4>Сценарий А — ${nl(c.approach.scenarioA.title)}</h4>
            <ul class="ve-list">${c.approach.scenarioA.items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
            <p class="ve-meta">${escapeHtml(c.approach.scenarioA.footer)}</p>
          </div>
          <div class="ve-card">
            <h4>Сценарий Б — ${nl(c.approach.scenarioB.title)}</h4>
            <ul class="ve-list">${c.approach.scenarioB.items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
            <p class="ve-meta">${escapeHtml(c.approach.scenarioB.footer)}</p>
          </div>
        </div>
      `, `
        ${field('Лейбл слева', 'approach.labelLeft')}
        ${field('Лейбл справа', 'approach.labelRight')}
        ${field('Заголовок', 'approach.heading', true)}
        ${field('Подзаголовок', 'approach.sub', true)}
        ${field('А — заголовок', 'approach.scenarioA.title', true)}
        ${field('А — низ', 'approach.scenarioA.footer')}
        ${listField('А — пункты', 'approach.scenarioA.items')}
        ${field('Б — заголовок', 'approach.scenarioB.title', true)}
        ${field('Б — низ', 'approach.scenarioB.footer')}
        ${listField('Б — пункты', 'approach.scenarioB.items')}
      `),

      blockShell('market', '02', 'Рынок', `
        <p class="ve-lead">${escapeHtml(c.market.heading)} <span style="color:var(--muted)">${escapeHtml(c.market.headingMuted)}</span></p>
        <div class="ve-grid">
          ${c.market.stats.map((s) => `<div class="ve-card"><h4>${escapeHtml(s.value)}%</h4><p class="ve-meta">${escapeHtml(s.copy)}</p><div class="ve-kicker"><span>${escapeHtml(s.source)}</span></div></div>`).join('')}
        </div>
        <p class="ve-lead">${nl(c.market.trainHeading)}</p>
        <p class="ve-meta">${escapeHtml(c.market.p1)}</p>
        <p class="ve-meta">${escapeHtml(c.market.p2)}</p>
        <p class="ve-lead">${escapeHtml(c.market.manifesto)}<br/><span style="color:var(--accent)">${escapeHtml(c.market.manifestoAccent)}</span></p>
        <div class="ve-media"><span>Video URL</span><code>${escapeHtml(c.market.videoUrl)}</code></div>
      `, `
        ${field('Лейбл слева', 'market.labelLeft')}
        ${field('Лейбл справа', 'market.labelRight')}
        ${field('Заголовок', 'market.heading')}
        ${field('Muted', 'market.headingMuted')}
        ${field('Поезд — заголовок', 'market.trainHeading', true)}
        ${field('Абзац 1', 'market.p1', true)}
        ${field('Абзац 2', 'market.p2', true)}
        ${field('Манифест', 'market.manifesto')}
        ${field('Манифест акцент', 'market.manifestoAccent', true)}
        ${field('Video URL', 'market.videoUrl', false, 'url')}
        ${c.market.stats.map((s, i) => `
          <div class="ve-card">
            ${field(`Стат ${i + 1} — %`, `market.stats.${i}.value`)}
            ${field('Текст', `market.stats.${i}.copy`, true)}
            ${field('Источник', `market.stats.${i}.source`)}
          </div>`).join('')}
      `),

      blockShell('workflow', '03', 'Workflow', `
        <p class="ve-lead">${nl(c.workflow.heading)} <span style="color:var(--accent)">${escapeHtml(c.workflow.headingAccent)}</span></p>
        <p class="ve-meta">${escapeHtml(c.workflow.p1)}</p>
        <p class="ve-meta">${escapeHtml(c.workflow.p2)}</p>
        <div class="ve-grid">
          ${c.workflow.steps.map((s, i) => `<div class="ve-card"><h4>0${i + 1}. ${escapeHtml(s.title)}</h4><p class="ve-meta">${escapeHtml(s.ai)}</p><p class="ve-meta"><strong>Роль:</strong> ${escapeHtml(s.human)}</p></div>`).join('')}
        </div>
        <p class="ve-lead">${escapeHtml(c.workflow.footerTitle)}</p>
        <p class="ve-meta">${escapeHtml(c.workflow.footerBody)}</p>
      `, `
        ${field('Лейбл слева', 'workflow.labelLeft')}
        ${field('Лейбл справа', 'workflow.labelRight')}
        ${field('Заголовок', 'workflow.heading', true)}
        ${field('Акцент', 'workflow.headingAccent')}
        ${field('Абзац 1', 'workflow.p1', true)}
        ${field('Абзац 2', 'workflow.p2', true)}
        ${c.workflow.steps.map((s, i) => `
          <div class="ve-card">
            ${field(`Шаг ${i + 1}`, `workflow.steps.${i}.title`)}
            ${field('ИИ', `workflow.steps.${i}.ai`, true)}
            ${field('Роль', `workflow.steps.${i}.human`, true)}
          </div>`).join('')}
        ${field('Футер заголовок', 'workflow.footerTitle')}
        ${field('Футер текст', 'workflow.footerBody', true)}
        ${field('Футер aside', 'workflow.footerAside', true)}
      `),

      blockShell('program', '04', 'Программа', `
        <p class="ve-lead">${nl(c.program.heading)}</p>
        <div class="ve-grid">
          ${c.program.modules.map((m) => `
            <div class="ve-card">
              <h4>${escapeHtml(m.month)} · ${escapeHtml(m.title)}</h4>
              <p class="ve-meta">${escapeHtml(m.weeks)}</p>
              <img class="ve-thumb" src="${escapeAttr(m.imageUrl)}" alt="" />
              <code>${escapeHtml(m.imageUrl)}</code>
            </div>`).join('')}
        </div>
        <p class="ve-meta">${escapeHtml(c.program.note)}</p>
        <div class="ve-chip">${escapeHtml(c.program.cta)} ↗</div>
      `, `
        ${field('Лейбл слева', 'program.labelLeft')}
        ${field('Лейбл справа', 'program.labelRight')}
        ${field('Заголовок', 'program.heading', true)}
        ${field('Заметка', 'program.note', true)}
        ${field('Низ', 'program.endLabel')}
        ${field('CTA', 'program.cta')}
        ${c.program.modules.map((m, mi) => `
          <div class="ve-card">
            <h4>Модуль ${mi + 1}</h4>
            ${field('Название', `program.modules.${mi}.title`)}
            ${field('Месяц', `program.modules.${mi}.month`)}
            ${field('Недели', `program.modules.${mi}.weeks`)}
            ${field('Картинка URL', `program.modules.${mi}.imageUrl`, false, 'url')}
            ${(m.rows || []).map((r, ri) => `
              ${field(`Неделя ${ri + 1}`, `program.modules.${mi}.rows.${ri}.week`)}
              ${field('Тема', `program.modules.${mi}.rows.${ri}.topic`, true)}
              ${field('Результат', `program.modules.${mi}.rows.${ri}.result`, true)}
            `).join('')}
          </div>`).join('')}
      `),

      blockShell('proof', '05', 'Результат', `
        <p class="ve-lead">${escapeHtml(c.proof.heading)}</p>
        <div class="ve-grid">
          <div class="ve-card">
            <img class="ve-thumb" src="${escapeAttr(c.proof.imageUrl)}" alt="${escapeAttr(c.proof.imageAlt)}" />
            <code>${escapeHtml(c.proof.imageUrl)}</code>
          </div>
          <div class="ve-card">
            <p class="ve-lead">“ ${escapeHtml(c.proof.quote)}</p>
            <p class="ve-meta">${escapeHtml(c.proof.author)}</p>
            <div class="ve-chip">${escapeHtml(c.proof.cta)} ↗</div>
          </div>
        </div>
        <div class="ve-grid">
          ${c.proof.stats.map((s) => `<div class="ve-card"><h4>${escapeHtml(s.a)} ${escapeHtml(s.b)} ${escapeHtml(s.c)}</h4><p class="ve-meta">${escapeHtml(s.label)}</p></div>`).join('')}
        </div>
      `, `
        ${field('Лейбл', 'proof.labelLeft')}
        ${field('Заголовок', 'proof.heading', true)}
        ${field('Фото URL', 'proof.imageUrl', false, 'url')}
        ${field('Alt', 'proof.imageAlt')}
        ${field('Цитата', 'proof.quote', true)}
        ${field('Автор', 'proof.author')}
        ${field('CTA', 'proof.cta')}
        ${c.proof.stats.map((s, i) => `
          <div class="ve-card">
            ${field('A', `proof.stats.${i}.a`)}
            ${field('B', `proof.stats.${i}.b`)}
            ${field('C', `proof.stats.${i}.c`)}
            ${field('Подпись', `proof.stats.${i}.label`)}
          </div>`).join('')}
      `),

      blockShell('audience', '06', 'Для кого', `
        <p class="ve-lead">${nl(c.audience.heading)}</p>
        <p class="ve-meta">${escapeHtml(c.audience.sub)}</p>
        <div class="ve-grid">
          <div class="ve-card">
            <h4>${escapeHtml(c.audience.fitTitle)}</h4>
            <ul class="ve-list">${c.audience.fit.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
          </div>
          <div class="ve-card">
            <h4>${escapeHtml(c.audience.notFitTitle)}</h4>
            <ul class="ve-list">${c.audience.notFit.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
          </div>
        </div>
      `, `
        ${field('Лейбл', 'audience.labelLeft')}
        ${field('Заголовок', 'audience.heading', true)}
        ${field('Подзаголовок', 'audience.sub')}
        ${field('Подойдёт — заголовок', 'audience.fitTitle')}
        ${listField('Подойдёт', 'audience.fit')}
        ${field('Не подойдёт — заголовок', 'audience.notFitTitle')}
        ${listField('Не подойдёт', 'audience.notFit')}
      `),

      blockShell('pricing', '07', 'Стоимость', `
        <p class="ve-lead">${nl(c.pricing.introHeading)}</p>
        <p class="ve-meta">${escapeHtml(c.pricing.introValue)}</p>
        <div class="ve-card">
          ${c.pricing.valueStack.map((r) => `<div class="ve-kicker"><span>${escapeHtml(r.item)}</span><span>${escapeHtml(r.price)}</span></div>`).join('')}
          <p class="ve-lead">${escapeHtml(c.pricing.valueTotalLabel)}: ${escapeHtml(c.pricing.valueTotal)}</p>
        </div>
        <div class="ve-card" style="margin-top:12px;background:#1a1b1c;color:#fff">
          <p class="ve-meta" style="color:#c5ccd3">${escapeHtml(c.pricing.offerLabel)}</p>
          <p class="ve-lead" style="color:#fff">${escapeHtml(c.pricing.price)} <s style="opacity:.6">${escapeHtml(c.pricing.priceOld)}</s></p>
          <p class="ve-meta" style="color:#c5ccd3">${escapeHtml(c.pricing.discountNote)}</p>
          <div class="ve-chip" style="background:var(--accent);border-color:var(--accent);color:#fff">${escapeHtml(c.pricing.cta)} ↗</div>
          <p class="ve-meta" style="color:#c5ccd3;margin-top:10px">${escapeHtml(seatsLeft)}</p>
        </div>
      `, `
        ${field('Лейбл слева', 'pricing.labelLeft')}
        ${field('Лейбл справа', 'pricing.labelRight')}
        ${field('Intro', 'pricing.introHeading', true)}
        ${field('Ценность текст', 'pricing.introValue')}
        ${field('Итого label', 'pricing.valueTotalLabel')}
        ${field('Итого', 'pricing.valueTotal')}
        ${c.pricing.valueStack.map((r, i) => `
          <div class="ve-card">
            ${field('Пункт', `pricing.valueStack.${i}.item`, true)}
            ${field('Цена', `pricing.valueStack.${i}.price`)}
          </div>`).join('')}
        ${field('Оффер label', 'pricing.offerLabel')}
        ${field('Цена', 'pricing.price')}
        ${field('Старая цена', 'pricing.priceOld')}
        ${field('Скидка', 'pricing.discountNote')}
        ${field('Рассрочка', 'pricing.installments')}
        ${field('CTA попапа', 'pricing.cta')}
        ${field('Дедлайн', 'pricing.deadline')}
        <p class="ve-hint">Места — в блоке «Единое поле мест».</p>
      `),

      blockShell('final', '08', 'Финал', `
        <p class="ve-lead">${escapeHtml(c.final.heading)}</p>
        <p class="ve-meta">${escapeHtml(c.final.p1)}</p>
        <p class="ve-lead">${nl(c.final.accent)}</p>
        <div class="ve-chip">${escapeHtml(c.final.cta)} ↗</div>
        <p class="ve-meta">${c.final.startNote ? escapeHtml(c.final.startNote) + ' · ' : ''}${escapeHtml(seatsLeft)}</p>
      `, `
        ${field('Лейбл слева', 'final.labelLeft')}
        ${field('Лейбл справа', 'final.labelRight')}
        ${field('Заголовок', 'final.heading', true)}
        ${field('Абзац', 'final.p1', true)}
        ${field('Акцент', 'final.accent', true)}
        ${field('CTA', 'final.cta')}
        ${field('Приписка перед местами', 'final.startNote')}
      `),

      blockShell('footer', 'Footer', 'Подвал', `
        <p class="ve-meta">${escapeHtml(c.footer.tagline)}</p>
        <p class="ve-meta">${escapeHtml(c.footer.legal)}</p>
        <div class="ve-kicker">
          <span>${escapeHtml(c.footer.offerLabel)}</span>
          <span>${escapeHtml(c.footer.privacyLabel)}</span>
          <span>${escapeHtml(c.footer.topLabel)}</span>
        </div>
      `, `
        ${field('Тэглайн', 'footer.tagline', true)}
        ${field('Юр. строка', 'footer.legal', true)}
        ${field('Оферта', 'footer.offerLabel')}
        ${field('Политика', 'footer.privacyLabel')}
        ${field('Наверх', 'footer.topLabel')}
      `),

      blockShell('enroll', 'Modal', 'Модалка записи', `
        <div class="ve-kicker"><span>${escapeHtml(c.enroll.label)}</span></div>
        <p class="ve-lead">${escapeHtml(c.enroll.title)}</p>
        <p class="ve-meta">${escapeHtml(c.enroll.note)}</p>
      `, `
        ${field('Лейбл', 'enroll.label')}
        ${field('Заголовок', 'enroll.title')}
        ${field('Заметка', 'enroll.note')}
      `),

      blockShell('success', 'Success', 'Страница оплаты', `
        <p class="ve-lead">${escapeHtml(c.success.title)}</p>
        <p class="ve-meta">${escapeHtml(c.success.lead)}</p>
        <p class="ve-meta">${escapeHtml(c.success.body)}</p>
        <p class="ve-meta">${escapeHtml(c.success.start)}</p>
        <div class="ve-chip">${escapeHtml(c.success.loginLabel)} ↗</div>
        <div class="ve-media"><code>${escapeHtml(c.success.loginUrl)}</code></div>
      `, `
        ${field('Заголовок', 'success.title')}
        ${field('Лид', 'success.lead')}
        ${field('Текст', 'success.body', true)}
        ${field('Старт', 'success.start')}
        ${field('Кнопка', 'success.loginLabel')}
        ${field('URL входа', 'success.loginUrl', false, 'url')}
      `),
    ].join('');

    root.innerHTML = html;
    if (openId) {
      const el = root.querySelector(`[data-block="${openId}"]`);
      if (el) {
        el.classList.add('is-editing');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function closeEdit(apply) {
    if (!state.editing) return;
    const block = document.querySelector(`[data-block="${state.editing}"]`);
    if (block && apply) collectFrom(block);
    state.editing = null;
    render();
    setStatus(apply ? 'Черновик обновлён · нажмите «Сохранить»' : 'Отменено');
  }

  document.getElementById('blocks').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-edit');
      if (state.editing && state.editing !== id) {
        const prev = document.querySelector(`[data-block="${state.editing}"]`);
        if (prev) collectFrom(prev);
      }
      state.editing = id;
      render();
      return;
    }
    const applyBtn = e.target.closest('[data-apply]');
    if (applyBtn) {
      closeEdit(true);
      return;
    }
    const cancelBtn = e.target.closest('[data-cancel]');
    if (cancelBtn) {
      // Discard only the open form; keep other draft edits already applied via «Готово».
      state.editing = null;
      render();
      setStatus('Отменено');
    }
  });

  function ensureContentShape(content) {
    const next = content && typeof content === 'object' ? content : {};
    const rem = parseInt(next.seats?.remaining, 10);
    const tot = parseInt(next.seats?.total, 10);
    next.seats = {
      remaining: Number.isFinite(rem) ? rem : 11,
      total: Number.isFinite(tot) ? tot : 20,
    };
    if (typeof next.externalScriptsHtml !== 'string') next.externalScriptsHtml = '';
    if (!next.hero || typeof next.hero !== 'object') next.hero = {};
    if (!next.hero.startNote) next.hero.startNote = 'Старт 1 декабря';
    if (!next.final || typeof next.final !== 'object') next.final = {};
    if (!next.final.startNote) next.final.startNote = 'Старт 1 декабря';
    return next;
  }

  async function loadContent(showStatus = true) {
    if (showStatus) setStatus('Загрузка…');
    const data = await api('content');
    state.content = ensureContentShape(data.content);
    if (showStatus) setStatus('Готово', 'ok');
  }

  async function saveAll() {
    if (state.editing) {
      const block = document.querySelector(`[data-block="${state.editing}"]`);
      if (block) collectFrom(block);
    }
    state.content = ensureContentShape(state.content);
    const btn = document.getElementById('saveAllBtn');
    btn.disabled = true;
    setStatus('Сохранение…');
    try {
      const data = await api('save', { method: 'POST', body: { content: state.content } });
      state.content = ensureContentShape(data.content);
      state.editing = null;
      render();
      setStatus('Сохранено · сайт подхватит после обновления', 'ok');
    } catch (err) {
      setStatus('Ошибка: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  }

  document.getElementById('saveAllBtn').addEventListener('click', saveAll);
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await api('logout', { method: 'POST', body: {} }); } catch (_) {}
    location.href = './';
  });

  loadContent()
    .then(() => render())
    .catch((err) => setStatus('Ошибка: ' + err.message, 'error'));
  </script>
</body>
</html>
