"use client";
import { useEffect, useRef, useState } from "react";
import ProgramModule from "./ProgramModule";
import SiteNoise from "./SiteNoise";
import SmoothScroll, { scrollToId } from "./SmoothScroll";

const scenarios = [
['Рынок уже заполнен теми, кто умеет генерировать картинки. Ты конкурируешь за проект с сотнями людей и даже с самими клиентами, которые научились генерировать.','Клиенты хотят больше за те же деньги, или платить меньше за твою обычную работу.','Джуны реально больше не нужны, с ними у бизнеса проблем в разы больше чем с нейронками. Клиент вбил промпт, получил посредственный результат, но зато без головняка.','Ты по-прежнему дизайнер. Просто всё чаще ловишь себя на мысли: «А не зря ли я вообще в этой профессии, и есть ли у неё будущее?»'],
['Ты не просто рисуешь макеты — ты создаёшь продукт: от брифа до 100% рабочего продукта.','Скорость выросла в разы, но решения, вкус и ответственность остались за тобой — именно поэтому тебя нельзя заменить подпиской.','Ты говоришь с клиентом на языке бизнеса и метрик, поэтому им с тобой комфортно сотрудничать.','Чек и качество проектов растёт благодаря масштабу, скорости работы и количеству проектов.','Ты уже не боишься новостей про ИИ. Ты их читаешь с интересом и внедряешь новые инструменты в свой процесс.']];
const stats=[['16','Дизайнеры и художники — крупнейшая доля вакансий с требованием ИИ-навыков в России','HH.RU'],['52','Дизайнеров уже используют генеративный ИИ','В РАБОЧЕМ ПРОЦЕССЕ'],['24','Ещё только собираются начать','СЛЕДУЮЩИЙ ШАГ'],['49','Графических специалистов считают, что ручное производство устареет в течение 5 лет','ГОРИЗОНТ — 5 ЛЕТ']];
const steps=[['Бриф и исследование','ИИ структурирует вводные, находит противоречия, собирает референсы и гипотезы.','Ты выбираешь лучший вариант.'],['Концепция','ИИ расширяет количество вариантов за минуты.','Ты выбираешь и управляешь концепцией, а не рисуешь с нуля.'],['Продакшн','ИИ делает вариации, адаптации, рутину, наводит порядок в макете.','Ты освобождаешь время для размышлений и принятия решений.'],['Защита и запуск','ИИ помогает упаковать решение, собрать спецификации, снять правки.','Твои решения. Твоя ответственность.']];
const modules=[
{month:'Месяц 1',weeks:'НЕДЕЛИ 1–4',title:'Лендинг',img:'050da3bdd76a9642.jpg',rows:[
['1','Всегда работающий VPN, оплата любых подписок картой РФ, установка ИИ агентов, установка скиллов и подключение репозитория.','Ты научишься разбираться в ИИ-агентах, подключать их и настраивать окружение для дальнейшей работы.'],
['2','Бриф, анализ целевой аудитории, формирование оффера','Ты научишься автоматизировать создание технической документации проекта на основании глубинных исследований при помощи ИИ-агентов.'],
['3','Смысловая структура лендинга, прототипирование, дизайн, адаптив, спецификация','Ты создашь только дизайн — дальше всё за тебя сделают нейронки: адаптивки, дизайн-систему и подготовят макет к вёрстке.'],
['4','Техническое задание, сборка, формы, анимация, оптимизация, тестирование, запуск','Ты напишешь техническое задание по проверенному шаблону, а агент сверстает, оптимизирует, подключит скрипты и запустит сайт за тебя. Тебе останется лишь проверить результат.']
]},
{month:'Месяц 2',weeks:'НЕДЕЛИ 5–8',title:'Многостраничный сайт',img:'fb693ab944af19c6.jpg',rows:[
['5','Структура сайта, контент-модель, навигация и UX','Ты разработаешь карту сайта и структуру страниц, а агент соберёт за тебя прототипную сетку.'],
['6','Дизайн-система, шаблонизация страниц, компоненты','Создаёшь дизайн главной — остальное за тебя делает агент, включая дизайн внутренних страниц и адаптивки.'],
['7','Сборка, навигация, CMS/панель контента','Ты пишешь техническое задание на вёрстку сайта и разработку админки. Теперь можно управлять контентом сайта.'],
['8','SEO-основа, проверка, передача, инструкция','Оптимизация сайта, настройка полей и метаданных, диагностика, тестирование и запуск. Всё руками ИИ-агентов.']
]},
{month:'Месяц 3',weeks:'НЕДЕЛИ 9–12',title:'Веб-сервис с админкой',img:'160fefd4abad8957.jpg',rows:[
['9','Бриф, роли, сценарий, схема данных','Ты придумаешь идею сервиса, проведёшь глубинное исследование и сформируешь задачу для создания веб-сервиса.'],
['10','Пользовательская часть, данные, ошибки','Ты разработаешь сценарии для клиентской части, возможности и ограничения пользователя.'],
['11','Админ-панель, разграничение доступа','Ты разработаешь сценарии для админской части, возможности, роли и ограничения.'],
['12','Тестирование, запуск, наблюдение и план развития','Проведёшь и составишь баг-репорт, запустишь проект онлайн. Отчёт по ошибкам после запуска, инструкция администратора, roadmap.']
]}];
const proofStats=[['1 МЕС','→','1 НЕД','СРОК ПРОЕКТА'],['3','КЕЙСА','+','ЭКОСИСТЕМА'],['12','НЕДЕЛЬ','ПРАКТИКИ','НА СВОИХ ПРОЕКТАХ']];
const fitFor=[
'Графическим, UX/UI и продуктовым дизайнерам с опытом от 1 года',
'Фрилансерам, которые хотят брать проекты «под ключ» и уйти от почасовой гонки',
'Тем, кто пробовал ИИ, но результат казался «шаблонным» и забросил',
'Тем, кто чувствует, что рынок меняется, и хочет двигаться первым, а не догонять'
];
const notFor=[
'Тем, кто ищет «100 промптов для Midjourney» и волшебную кнопку',
'Тем, кто не готов выделить 4–5 часов в неделю на практику на своих проектах',
'Тем, кто хочет остаться в роли исполнителя и не брать ответственность за результат'
];
const valueStack:[string,string,boolean?][]=[
['8 модулей с практикой на твоих реальных проектах','40 000 ₽'],
['Личная карта внедрения ИИ в твой процесс','8 000 ₽'],
['Библиотека шаблонов: бриф, чек-лист аудита, сценарии для вариаций, шаблоны хендоффа','12 000 ₽'],
['Проверенные промты для экономии лимитов','10 000 ₽'],
['Разборы работ от куратора (персональная обратная связь)','30 000 ₽'],
['Чат поддержки с ответами на любые вопросы','10 000 ₽'],
['Три реальных рабочих кейса в портфолио','бесценно',true]
];

export default function Home(){
const [menu,setMenu]=useState(false);
const [motion,setMotion]=useState(true);
const [heroReady,setHeroReady]=useState(false);
const dialog=useRef<HTMLDialogElement>(null);
const video=useRef<HTMLVideoElement>(null);

useEffect(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){setMotion(false);setHeroReady(true);}
  else{requestAnimationFrame(()=>setHeroReady(true));}
  const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
  return()=>observer.disconnect();
},[]);

useEffect(()=>{
  document.documentElement.dataset.motion=motion?'on':'off';
  if(motion)video.current?.play().catch(()=>{});
  else video.current?.pause();
},[motion]);

const enroll=()=>dialog.current?.showModal();

return <>
<SmoothScroll enabled={motion}/>
<SiteNoise enabled={motion}/>
<a href="#main" className="skip">Перейти к содержимому</a>
<header className="header"><a href="#top" className="brand">AI WORKFLOW<span className="brand-mark">↗</span></a><nav className={menu?'nav open':'nav'} aria-label="Главная навигация"><a href="#approach" onClick={()=>setMenu(false)}>ПОДХОД</a><a href="#workflow" onClick={()=>setMenu(false)}>WORKFLOW</a><a href="#program" onClick={()=>setMenu(false)}>ПРОГРАММА</a><a href="#proof" onClick={()=>setMenu(false)}>ДОКАЗАТЕЛЬСТВА</a><a href="#pricing" onClick={()=>setMenu(false)}>СТОИМОСТЬ</a></nav><button className="header-cta" onClick={enroll}>ЗАПИСАТЬСЯ <span>↗</span></button><button className="menu-toggle" aria-label={menu?'Закрыть меню':'Открыть меню'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?'×':'☰'}</button></header>
<main id="main">
<section id="top" className={heroReady?'hero is-ready':'hero'}>
<div className="hero-kicker hero-reveal" data-d="1"><span><i className="dot"/> ПРАКТИЧЕСКИЙ КУРС ДЛЯ ДИЗАЙНЕРОВ</span><span>НОВЫЙ ПОТОК / 01 ДЕКАБРЯ</span></div>
<div className="offer hero-reveal" data-d="2"><span>↗</span> Специальные условия для участников эфира действуют до 16 ноября</div>
<h1 className="hero-reveal" data-d="3"><span>AI</span> WORKFLOW</h1>
<div className="hero-content">
<div className="hero-copy">
<p className="hero-reveal" data-d="4">Из дизайнера в незаменимого партнёра любого бизнеса, ведущего продукт от идеи до результата. <span className="duration-highlight">За 12 недель.</span></p>
<button className="button hero-reveal" data-d="5" onClick={enroll}>ЗАПИСАТЬСЯ НА КУРС <span>↗</span></button>
<div className="availability hero-reveal" data-d="6"><i className="dot"/> Осталось 11 мест из 20 · Старт 1 декабря</div>
<p className="installments hero-reveal" data-d="7">Рассрочка без переплат на 3 / 6 / 10 месяцев</p>
</div>
<div className="hero-visual hero-reveal" data-d="8"><video ref={video} autoPlay muted loop playsInline preload="none" poster="/assets/28487bca5aacbdfe.jpg" src="https://framerusercontent.com/assets/EtYSNxBoMj8wYzBWzYZJIcmGgdg.mp4" aria-label="Промышленный робот — визуальная заглушка из CROX"/><div className="visual-top"><span>HUMAN × MACHINE</span><span className="live"><i/> В ПРОЦЕССЕ</span></div><div className="visual-bottom"><span>РЕШЕНИЯ ОСТАЮТСЯ ЗА ТОБОЙ</span><button aria-label={motion?'Приостановить анимации':'Включить анимации'} onClick={()=>setMotion(!motion)}>{motion?'Ⅱ':'▷'}</button></div></div>
<div className="hero-status hero-reveal" data-d="9"><span className="small">СИСТЕМА ОБУЧЕНИЯ</span><div><span>ФОРМАТ</span><b>ПРАКТИКА</b></div><div><span>СТАРТ</span><b>01.12</b></div><div><span>МЕСТ В ГРУППЕ</span><b>20</b></div><div className="status-arrow">↘</div><span className="small">ОТ ИДЕИ<br/>ДО РЕЗУЛЬТАТА</span></div>
</div>
<div className="ticker hero-reveal" data-d="10" aria-hidden="true"><div>{[0,1].map(i=><span key={i}>{("БРИФ И ИССЛЕДОВАНИЕ　/　КОНЦЕПЦИЯ　/　ПРОДАКШН　/　ЗАЩИТА И ЗАПУСК　/　ТВОЙ НОВЫЙ WORKFLOW　/　").repeat(3)}</span>)}</div></div>
</section>
<section id="approach" className="section scenarios"><div className="section-label"><span>01 / ТОЧКА ВЫБОРА</span><span>ДВА СЦЕНАРИЯ → ОДНО РЕШЕНИЕ</span></div><div className="section-heading reveal"><h2>Через два года в дизайне<br/>будут две категории людей.</h2><p>Ты уже выбираешь,<br/>в какой окажешься.</p></div><div className="scenario-grid">{scenarios.map((items,index)=><article className={'scenario reveal '+(index?'positive':'negative')} key={index}><div className="scenario-top"><span>СЦЕНАРИЙ {index?'Б':'А'}</span><span>{index?'↗':'↘'}</span></div><h3>{index?<>Если внедрить ИИ<br/>в workflow</>:<>Если ничего<br/>не менять</>}</h3><ul>{items.map((text,n)=><li key={n}><span>{index?'+':'−'}</span><p>{text}</p></li>)}</ul><div className="scenario-bottom">{index?'ТЫ УПРАВЛЯЕШЬ ПРОЦЕССОМ':'ТЫ ОСТАЁШЬСЯ ИСПОЛНИТЕЛЕМ'}<span>{index?'↗':'↘'}</span></div></article>)}</div></section>
<section id="market" className="section market"><div className="section-label"><span>02 / НОВАЯ РЕАЛЬНОСТЬ</span><span>РЫНОК УЖЕ ИЗМЕНИЛСЯ</span></div><h2 className="reveal">Рынок дизайна<br/><span className="muted">сегодня.</span></h2><div className="stats">{stats.map(([value,copy,source])=><article className="stat reveal" key={value}><div className="stat-number">{value}<span>%</span></div><p>{copy}</p><span className="small">{source}</span></article>)}</div><div className="market-bottom"><div className="market-image reveal"><img src="/assets/46f26f7c5eea22c3.png" alt="Робот с красным сенсором — визуальная заглушка" loading="lazy"/><span>EVOLVE YOUR PROCESS ↗</span></div><div className="market-copy reveal"><h3>Поезд уходит не завтра —<br/>он уже ушёл давно,<br/>ещё в 2024-м.</h3><p>Но есть и хорошие новости: Nielsen Norman Group и ведущие аналитики прогнозируют не исчезновение профессии, а её переформатирование.</p><p>Обесценивается не дизайн. Обесценивается дизайн как механическое производство экранов. Растёт в цене дизайн как насмотренность, исследование, системное мышление и ответственность за результат.</p><div className="manifesto">ИИ не заменит дизайнера.<br/><span>ИИ заменит дизайнера, который не умеет его использовать — и поднимет в статусе того, кто умеет.</span></div></div></div></section>
<section id="workflow" className="section workflow"><div className="section-label"><span>03 / ОДНА СИСТЕМА</span><span>HUMAN-LED. AI-POWERED.</span></div><div className="workflow-intro reveal"><h2>Дело не<br/>в инструментах.<br/><span>Дело в том, как они встроены в процесс.</span></h2><div><p>Проблема 90% дизайнеров, которые попробовали ИИ, одна и та же: они используют нейросеть как генератор картинок. Отсюда и появляется ощущение, что ИИ только для контента, изображений и видео.</p><p>На самом деле ИИ можно встроить в каждый этап процесса, и на каждом этапе у него своя роль, свои границы и свой способ проверки.</p></div></div><div className="process">{steps.map(([title,ai,human],i)=><article key={title} className="step reveal"><div className="step-line"><span>0{i+1}</span><span>→</span></div><h3>{title}</h3><p>{ai}</p><div className="human"><span>ТВОЯ РОЛЬ</span><p>{human}</p></div></article>)}</div><div className="process-footer reveal"><span className="asterisk">✳</span><div><h3>Не промпты. Непрерывный workflow.</h3><p>Курс учит собирать из этих шагов один непрерывный workflow, где ИИ ускоряет работу, но ни одно решение не отдаётся машине.</p></div><p>Твоя насмотренность, вкус и ответственность — это то, что делает результат не шаблонным. И именно это нельзя автоматизировать.</p></div></section>
<section id="program" className="section program"><div className="section-label"><span>04 / ПРОГРАММА</span><span>ОТ ПЕРВОГО БРИФА ДО ЗАПУСКА</span></div><div className="section-heading reveal"><h2>Программа — от идеи<br/>до готового продукта за 12 недель.</h2><span className="program-mark">↙</span></div><div className="modules">{modules.map((mod,i)=><ProgramModule key={mod.title} index={i} title={mod.title} month={mod.month} weeks={mod.weeks}><div className="module-content"><div className="module-image"><img src={'/assets/'+mod.img} alt="Инженерный проект — временный визуальный материал CROX" loading="lazy"/><span>ПРОЕКТ 0{i+1} / ПРАКТИКА</span></div><div className="weeks"><div className="table-head"><span>НЕДЕЛЯ</span><span>ТЕМА</span><span>РЕЗУЛЬТАТ</span></div>{mod.rows.map(([week,topic,result])=><div className="week" key={week}><span>{week.padStart(2,'0')}</span><h3>{topic}</h3><p>{result}</p></div>)}</div></div></ProgramModule>)}</div><div className="program-note reveal"><p>Каждый проект снабжается большим кейсом в портфолио с реальным проектом, а четвёртый кейс объединяет все три проекта в единую экосистему.</p></div><div className="program-end"><span>БРИФ → КОНЦЕПЦИЯ → ПРОДУКТ</span><button className="button" onClick={enroll}>ЗАПИСАТЬСЯ НА КУРС <span>↗</span></button></div></section>
<section id="proof" className="section proof"><div className="section-label"><span>05 / ДОКАЗАТЕЛЬСТВА</span><span>КТО ВЕДЁТ И КТО УЖЕ ПРОШЁЛ</span></div><div className="proof-heading reveal"><h2>Это не теория. Это мой личный workflow, при помощи которого сроки разработки проекта я сократил с одного месяца до одной недели.</h2></div><div className="proof-grid"><div className="proof-visual reveal"><img src="/assets/speaker.jpg" alt="Спикер курса — временный визуальный материал" loading="lazy"/></div><div className="proof-copy reveal"><div className="proof-quote-mark" aria-hidden="true">“</div><blockquote><p>Я не обещаю, что после курса твой доход вырастет втрое. Я обещаю, что ты перестанешь терять время на то, что уже можно автоматизировать, и сможешь вести проекты другого масштаба.</p></blockquote><div className="proof-author"><span className="proof-author-name">Артур Андрейко</span></div><button className="button" onClick={enroll}>ЗАПИСАТЬСЯ НА КУРС <span>↗</span></button></div></div><div className="proof-stats">{proofStats.map(([a,b,c,label],i)=><article className="proof-stat reveal" key={label}><div className="proof-stat-row"><span>{a}</span><span>{b}</span><span>{c}</span></div><span className="small">{label}</span>{i<proofStats.length-1?<span className="proof-stat-arrow" aria-hidden="true">→</span>:null}</article>)}</div></section>
<section id="audience" className="section audience"><div className="section-label"><span>06 / ДЛЯ КОГО</span><span>ЧЕСТНЫЙ ФИЛЬТР</span></div><div className="section-heading reveal"><h2>Честно о том,<br/>кому это не нужно.</h2><p>Сначала отсев.<br/>Потом набор.</p></div><div className="audience-grid"><article className="audience-col fit reveal"><div className="audience-top"><span>КОМУ ТОЧНО ПОДОЙДЁТ</span><span>+</span></div><ul>{fitFor.map(text=><li key={text}><span>+</span><p>{text}</p></li>)}</ul></article><article className="audience-col nofit reveal"><div className="audience-top"><span>КОМУ НЕ ПОДОЙДЁТ</span><span>−</span></div><ul>{notFor.map(text=><li key={text}><span>−</span><p>{text}</p></li>)}</ul></article></div></section>
<section id="pricing" className="section pricing"><div className="section-label"><span>07 / СТОИМОСТЬ</span><span>ЦЕНА ДЛЯ УЧАСТНИКОВ ЭФИРА</span></div><div className="pricing-layout"><div className="pricing-intro reveal"><h2>Что ты<br/>получаешь?</h2><p>Стопка ценности — с якорем цены у каждого пункта. Полная ценность курса: 110 000 ₽.</p></div><div className="value-stack reveal"><div className="value-head"><span>СОСТАВ</span><span>ЯКОРЬ</span></div>{valueStack.map(([item,price,priceless])=><div className={'value-row'+(priceless?' priceless':'')} key={item}><p>{item}</p><span>{price}</span></div>)}<div className="value-total"><span>Ценность курса</span><b>110 000 ₽</b></div></div></div><div className="pricing-offer reveal"><div className="offer-price"><span className="small">ЦЕНА ДЛЯ УЧАСТНИКОВ ЭФИРА</span><div className="price-row"><b>40 000 ₽</b><s>60 000 ₽</s></div><p>Скидка действует до 16 ноября</p></div><div className="offer-meta"><p>Доступна рассрочка без переплат на 3 / 6 / 10 месяцев</p><button className="button" onClick={enroll}>ЗАБРАТЬ МЕСТО СО СКИДКОЙ <span>↗</span></button><div className="availability"><i className="dot"/> Осталось 14 мест из 20</div><p className="offer-deadline">Набор закрывается 1 декабря или когда закончатся места</p></div></div></section>
<section id="final" className="section final-cta"><div className="section-label"><span>08 / РЕШЕНИЕ</span><span>ОДНА КНОПКА</span></div><div className="final-inner reveal"><h2>Ты уже знаешь, что дальше будет по-другому. Вопрос только — с какой стороны ты окажешься.</h2><p>Через два года ты будешь либо тем дизайнером, которого заменили подпиской за 20 долларов. Либо тем, кто ведёт продукт от идеи до результата, кому доверяют сложное и платят за уровень.</p><p className="final-accent">Разница между этими двумя людьми — не талант. Не удача. Не связи.<br/>Это 12 недель системной работы — которые начинаются с одной кнопки.</p><button className="button button-lg" onClick={enroll}>ЗАНЯТЬ МЕСТО НА ПОТОКЕ <span>↗</span></button><div className="availability"><i className="dot"/> Старт 1 декабря · Осталось 14 мест из 20</div></div></section>
</main>
<footer className="site-footer"><div className="footer-brand"><a className="brand" href="#top">AI WORKFLOW <span className="brand-mark">↗</span></a><p>© AI WorkFlow — Стань незаменимым специалистом способным создать и вести проект от брифа до релиза готового продукта</p></div><div className="footer-legal"><p>ИП АНДРЕЙКО АРТУР ЕВГЕНЬЕВИЧ / ОГРН 309616705200021 / ИНН 616706226701</p><div className="footer-links"><a href="#offer">Договор оферты</a><span aria-hidden="true">|</span><a href="#privacy">Политика конфиденциальности</a><a href="#top">НАВЕРХ ↑</a></div></div></footer>
<div id="offer" className="legal-anchor" hidden aria-hidden="true"/>
<div id="privacy" className="legal-anchor" hidden aria-hidden="true"/>
<dialog ref={dialog} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}><button className="dialog-close" onClick={()=>dialog.current?.close()} aria-label="Закрыть">×</button><span className="small">AI WORKFLOW / НОВЫЙ ПОТОК</span><h2>Твой следующий<br/>шаг.</h2><p>Старт 1 декабря · Осталось 11 мест из 20</p><p>Форма записи появится здесь после подключения регистрации. Сейчас можно изучить программу курса.</p><button className="button" onClick={()=>{dialog.current?.close();scrollToId('program')}}>СМОТРЕТЬ ПРОГРАММУ <span>↓</span></button></dialog>
</>}
