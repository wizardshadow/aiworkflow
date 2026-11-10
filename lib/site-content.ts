export type NavItem = { id: string; label: string };

export type ScenarioBlock = {
  title: string;
  footer: string;
  items: string[];
};

export type StatItem = { value: string; copy: string; source: string };

export type StepItem = { title: string; ai: string; human: string };

export type ModuleRow = { week: string; topic: string; result: string };

export type ProgramModuleContent = {
  month: string;
  weeks: string;
  title: string;
  imageUrl: string;
  rows: ModuleRow[];
};

export type ProofStat = { a: string; b: string; c: string; label: string };

export type ValueRow = { item: string; price: string; priceless?: boolean };

export type SiteContent = {
  version: number;
  updatedAt: string;
  nav: NavItem[];
  headerCta: string;
  hero: {
    kickerLeft: string;
    kickerRight: string;
    offer: string;
    titleAi: string;
    titleRest: string;
    lead: string;
    duration: string;
    cta: string;
    availability: string;
    installments: string;
    videoUrl: string;
    visualTopLeft: string;
    visualTopRight: string;
    visualBottom: string;
    statusLabel: string;
    formatLabel: string;
    formatValue: string;
    startLabel: string;
    startValue: string;
    seatsLabel: string;
    seatsValue: string;
    statusFooter: string;
    ticker: string;
  };
  approach: {
    labelLeft: string;
    labelRight: string;
    heading: string;
    sub: string;
    scenarioA: ScenarioBlock;
    scenarioB: ScenarioBlock;
  };
  market: {
    labelLeft: string;
    labelRight: string;
    heading: string;
    headingMuted: string;
    stats: StatItem[];
    videoUrl: string;
    trainHeading: string;
    p1: string;
    p2: string;
    manifesto: string;
    manifestoAccent: string;
  };
  workflow: {
    labelLeft: string;
    labelRight: string;
    heading: string;
    headingAccent: string;
    p1: string;
    p2: string;
    steps: StepItem[];
    footerTitle: string;
    footerBody: string;
    footerAside: string;
  };
  program: {
    labelLeft: string;
    labelRight: string;
    heading: string;
    modules: ProgramModuleContent[];
    note: string;
    endLabel: string;
    cta: string;
  };
  proof: {
    labelLeft: string;
    heading: string;
    imageUrl: string;
    imageAlt: string;
    quote: string;
    author: string;
    cta: string;
    stats: ProofStat[];
  };
  audience: {
    labelLeft: string;
    heading: string;
    sub: string;
    fitTitle: string;
    fit: string[];
    notFitTitle: string;
    notFit: string[];
  };
  pricing: {
    labelLeft: string;
    labelRight: string;
    introHeading: string;
    introValue: string;
    valueTotalLabel: string;
    valueTotal: string;
    valueStack: ValueRow[];
    offerLabel: string;
    price: string;
    priceOld: string;
    discountNote: string;
    installments: string;
    cta: string;
    availability: string;
    deadline: string;
  };
  final: {
    labelLeft: string;
    labelRight: string;
    heading: string;
    p1: string;
    accent: string;
    cta: string;
    availability: string;
  };
  footer: {
    tagline: string;
    legal: string;
    offerLabel: string;
    privacyLabel: string;
    topLabel: string;
  };
  enroll: {
    label: string;
    title: string;
    note: string;
  };
  success: {
    title: string;
    lead: string;
    body: string;
    start: string;
    loginLabel: string;
    loginUrl: string;
  };
};

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,
  updatedAt: "2026-11-10T00:00:00.000Z",
  nav: [
    { id: "approach", label: "ПОДХОД" },
    { id: "workflow", label: "WORKFLOW" },
    { id: "program", label: "ПРОГРАММА" },
    { id: "proof", label: "РЕЗУЛЬТАТ" },
    { id: "pricing", label: "СТОИМОСТЬ" },
  ],
  headerCta: "ЗАПИСАТЬСЯ",
  hero: {
    kickerLeft: "ПРАКТИЧЕСКИЙ КУРС ДЛЯ ДИЗАЙНЕРОВ",
    kickerRight: "НОВЫЙ ПОТОК / 01 ДЕКАБРЯ",
    offer:
      "Специальные условия для участников эфира действуют до 16 ноября",
    titleAi: "AI",
    titleRest: "WORKFLOW",
    lead: "Из дизайнера в незаменимого партнёра любого бизнеса, ведущего продукт от идеи до результата.",
    duration: "За 12 недель.",
    cta: "ЗАПИСАТЬСЯ НА КУРС",
    availability: "Осталось 11 мест из 20 · Старт 1 декабря",
    installments: "Рассрочка без переплат на 3 / 6 / 10 месяцев",
    videoUrl: "https://aiworkflow.modules.club/assets/aimain.webm",
    visualTopLeft: "HUMAN × MACHINE",
    visualTopRight: "В ПРОЦЕССЕ",
    visualBottom: "РЕШЕНИЯ ОСТАЮТСЯ ЗА ТОБОЙ",
    statusLabel: "СИСТЕМА ОБУЧЕНИЯ",
    formatLabel: "ФОРМАТ",
    formatValue: "ПРАКТИКА",
    startLabel: "СТАРТ",
    startValue: "01.12",
    seatsLabel: "МЕСТ В ГРУППЕ",
    seatsValue: "20",
    statusFooter: "ОТ ИДЕИ\nДО РЕЗУЛЬТАТА",
    ticker:
      "БРИФ И ИССЛЕДОВАНИЕ　/　КОНЦЕПЦИЯ　/　ПРОДАКШН　/　ЗАЩИТА И ЗАПУСК　/　ТВОЙ НОВЫЙ WORKFLOW　/　",
  },
  approach: {
    labelLeft: "01 / ТОЧКА ВЫБОРА",
    labelRight: "ДВА СЦЕНАРИЯ → ОДНО РЕШЕНИЕ",
    heading: "Через два года в дизайне\nбудут две категории людей.",
    sub: "Ты уже выбираешь,\nв какой окажешься.",
    scenarioA: {
      title: "Если ничего\nне менять",
      footer: "ТЫ ОСТАЁШЬСЯ ИСПОЛНИТЕЛЕМ",
      items: [
        "Рынок уже заполнен теми, кто умеет генерировать картинки. Ты конкурируешь за проект с сотнями людей и даже с самими клиентами, которые научились генерировать.",
        "Клиенты хотят больше за те же деньги, или платить меньше за твою обычную работу.",
        "Джуны реально больше не нужны, с ними у бизнеса проблем в разы больше чем с нейронками. Клиент вбил промпт, получил посредственный результат, но зато без головняка.",
        "Ты по-прежнему дизайнер. Просто всё чаще ловишь себя на мысли: «А не зря ли я вообще в этой профессии, и есть ли у неё будущее?»",
      ],
    },
    scenarioB: {
      title: "Если внедрить ИИ\nв workflow",
      footer: "ТЫ УПРАВЛЯЕШЬ ПРОЦЕССОМ",
      items: [
        "Ты не просто рисуешь макеты — ты создаёшь продукт: от брифа до 100% рабочего продукта.",
        "Скорость выросла в разы, но решения, вкус и ответственность остались за тобой — именно поэтому тебя нельзя заменить подпиской.",
        "Ты говоришь с клиентом на языке бизнеса и метрик, поэтому им с тобой комфортно сотрудничать.",
        "Чек и качество проектов растёт благодаря масштабу, скорости работы и количеству проектов.",
        "Ты уже не боишься новостей про ИИ. Ты их читаешь с интересом и внедряешь новые инструменты в свой процесс.",
      ],
    },
  },
  market: {
    labelLeft: "02 / НОВАЯ РЕАЛЬНОСТЬ",
    labelRight: "РЫНОК УЖЕ ИЗМЕНИЛСЯ",
    heading: "Рынок дизайна",
    headingMuted: "сегодня.",
    stats: [
      {
        value: "16",
        copy: "Дизайнеры и художники — крупнейшая доля вакансий с требованием ИИ-навыков в России",
        source: "HH.RU",
      },
      {
        value: "52",
        copy: "Дизайнеров уже используют генеративный ИИ",
        source: "В РАБОЧЕМ ПРОЦЕССЕ",
      },
      {
        value: "24",
        copy: "Ещё только собираются начать",
        source: "СЛЕДУЮЩИЙ ШАГ",
      },
      {
        value: "49",
        copy: "Графических специалистов считают, что ручное производство устареет в течение 5 лет",
        source: "ГОРИЗОНТ — 5 ЛЕТ",
      },
    ],
    videoUrl: "https://aiworkflow.modules.club/assets/atrain.webm",
    trainHeading: "Поезд уходит не завтра —\nон уже ушёл давно,\nещё в 2024-м.",
    p1: "Но есть и хорошие новости: Nielsen Norman Group и ведущие аналитики прогнозируют не исчезновение профессии, а её переформатирование.",
    p2: "Обесценивается не дизайн. Обесценивается дизайн как механическое производство экранов. Растёт в цене дизайн как насмотренность, исследование, системное мышление и ответственность за результат.",
    manifesto: "ИИ не заменит дизайнера.",
    manifestoAccent:
      "ИИ заменит дизайнера, который не умеет его использовать — и поднимет в статусе того, кто умеет.",
  },
  workflow: {
    labelLeft: "03 / ОДНА СИСТЕМА",
    labelRight: "HUMAN-LED. AI-POWERED.",
    heading: "Дело не\nв инструментах.",
    headingAccent: "Дело в том, как они встроены в процесс.",
    p1: "Проблема 90% дизайнеров, которые попробовали ИИ, одна и та же: они используют нейросеть как генератор картинок. Отсюда и появляется ощущение, что ИИ только для контента, изображений и видео.",
    p2: "На самом деле ИИ можно встроить в каждый этап процесса, и на каждом этапе у него своя роль, свои границы и свой способ проверки.",
    steps: [
      {
        title: "Бриф и исследование",
        ai: "ИИ структурирует вводные, находит противоречия, собирает референсы и гипотезы.",
        human: "Ты выбираешь лучший вариант.",
      },
      {
        title: "Концепция",
        ai: "ИИ расширяет количество вариантов за минуты.",
        human: "Ты выбираешь и управляешь концепцией, а не рисуешь с нуля.",
      },
      {
        title: "Продакшн",
        ai: "ИИ делает вариации, адаптации, рутину, наводит порядок в макете.",
        human: "Ты освобождаешь время для размышлений и принятия решений.",
      },
      {
        title: "Защита и запуск",
        ai: "ИИ помогает упаковать решение, собрать спецификации, снять правки.",
        human: "Твои решения. Твоя ответственность.",
      },
    ],
    footerTitle: "Не промпты. Непрерывный workflow.",
    footerBody:
      "Курс учит собирать из этих шагов один непрерывный workflow, где ИИ ускоряет работу, но ни одно решение не отдаётся машине.",
    footerAside:
      "Твоя насмотренность, вкус и ответственность — это то, что делает результат не шаблонным. И именно это нельзя автоматизировать.",
  },
  program: {
    labelLeft: "04 / ПРОГРАММА",
    labelRight: "ОТ ПЕРВОГО БРИФА ДО ЗАПУСКА",
    heading: "Программа — от идеи\nдо готового продукта за 12 недель.",
    modules: [
      {
        month: "Месяц 1",
        weeks: "НЕДЕЛИ 1–4",
        title: "Лендинг",
        imageUrl: "/assets/050da3bdd76a9642.jpg",
        rows: [
          {
            week: "1",
            topic:
              "Всегда работающий VPN, оплата любых подписок картой РФ, установка ИИ агентов, установка скиллов и подключение репозитория.",
            result:
              "Ты научишься разбираться в ИИ-агентах, подключать их и настраивать окружение для дальнейшей работы.",
          },
          {
            week: "2",
            topic: "Бриф, анализ целевой аудитории, формирование оффера",
            result:
              "Ты научишься автоматизировать создание технической документации проекта на основании глубинных исследований при помощи ИИ-агентов.",
          },
          {
            week: "3",
            topic:
              "Смысловая структура лендинга, прототипирование, дизайн, адаптив, спецификация",
            result:
              "Ты создашь только дизайн — дальше всё за тебя сделают нейронки: адаптивки, дизайн-систему и подготовят макет к вёрстке.",
          },
          {
            week: "4",
            topic:
              "Техническое задание, сборка, формы, анимация, оптимизация, тестирование, запуск",
            result:
              "Ты напишешь техническое задание по проверенному шаблону, а агент сверстает, оптимизирует, подключит скрипты и запустит сайт за тебя. Тебе останется лишь проверить результат.",
          },
        ],
      },
      {
        month: "Месяц 2",
        weeks: "НЕДЕЛИ 5–8",
        title: "Многостраничный сайт",
        imageUrl: "/assets/fb693ab944af19c6.jpg",
        rows: [
          {
            week: "5",
            topic: "Структура сайта, контент-модель, навигация и UX",
            result:
              "Ты разработаешь карту сайта и структуру страниц, а агент соберёт за тебя прототипную сетку.",
          },
          {
            week: "6",
            topic: "Дизайн-система, шаблонизация страниц, компоненты",
            result:
              "Создаёшь дизайн главной — остальное за тебя делает агент, включая дизайн внутренних страниц и адаптивки.",
          },
          {
            week: "7",
            topic: "Сборка, навигация, CMS/панель контента",
            result:
              "Ты пишешь техническое задание на вёрстку сайта и разработку админки. Теперь можно управлять контентом сайта.",
          },
          {
            week: "8",
            topic: "SEO-основа, проверка, передача, инструкция",
            result:
              "Оптимизация сайта, настройка полей и метаданных, диагностика, тестирование и запуск. Всё руками ИИ-агентов.",
          },
        ],
      },
      {
        month: "Месяц 3",
        weeks: "НЕДЕЛИ 9–12",
        title: "Веб-сервис с админкой",
        imageUrl: "/assets/160fefd4abad8957.jpg",
        rows: [
          {
            week: "9",
            topic: "Бриф, роли, сценарий, схема данных",
            result:
              "Ты придумаешь идею сервиса, проведёшь глубинное исследование и сформируешь задачу для создания веб-сервиса.",
          },
          {
            week: "10",
            topic: "Пользовательская часть, данные, ошибки",
            result:
              "Ты разработаешь сценарии для клиентской части, возможности и ограничения пользователя.",
          },
          {
            week: "11",
            topic: "Админ-панель, разграничение доступа",
            result:
              "Ты разработаешь сценарии для админской части, возможности, роли и ограничения.",
          },
          {
            week: "12",
            topic: "Тестирование, запуск, наблюдение и план развития",
            result:
              "Проведёшь и составишь баг-репорт, запустишь проект онлайн. Отчёт по ошибкам после запуска, инструкция администратора, roadmap.",
          },
        ],
      },
    ],
    note: "Каждый проект снабжается большим кейсом в портфолио с реальным проектом, а четвёртый кейс объединяет все три проекта в единую экосистему.",
    endLabel: "БРИФ → КОНЦЕПЦИЯ → ПРОДУКТ",
    cta: "ЗАПИСАТЬСЯ НА КУРС",
  },
  proof: {
    labelLeft: "05 / ЛИЧНЫЙ ОПЫТ",
    heading:
      "Это не теория. Это мой личный workflow, при помощи которого сроки разработки проекта я сократил с одного месяца до одной недели.",
    imageUrl: "/assets/speaker.jpg",
    imageAlt: "Артур Андрейко — спикер курса AI WORKFLOW",
    quote:
      "Я не обещаю, что после курса твой доход вырастет втрое. Я обещаю, что ты перестанешь терять время на то, что уже можно автоматизировать, и сможешь вести проекты другого масштаба.",
    author: "Артур Андрейко",
    cta: "ЗАПИСАТЬСЯ НА КУРС",
    stats: [
      { a: "1 МЕС", b: "→", c: "1 НЕД", label: "СОКРАЩАЕТСЯ ВРЕМЯ РАЗРАБОТКИ" },
      { a: "3", b: "КЕЙСА", c: "+", label: "ИЗ РАБОЧИХ ПРОЕКТОВ" },
      { a: "12", b: "НЕДЕЛЬ", c: "ПРАКТИКИ", label: "НА СВОИХ ПРОЕКТАХ" },
    ],
  },
  audience: {
    labelLeft: "06 / ДЛЯ КОГО",
    heading: "Честно о том,\nкому это не нужно.",
    sub: "Для тех кто хочет стать сильнее",
    fitTitle: "КОМУ ТОЧНО ПОДОЙДЁТ",
    fit: [
      "Графическим, UX/UI и продуктовым дизайнерам с опытом от 1 года",
      "Фрилансерам, которые хотят брать проекты «под ключ» и уйти от почасовой гонки",
      "Тем, кто пробовал ИИ, но результат казался «шаблонным» и забросил",
      "Тем, кто чувствует, что рынок меняется, и хочет двигаться первым, а не догонять",
    ],
    notFitTitle: "КОМУ НЕ ПОДОЙДЁТ",
    notFit: [
      "Тем, кто ищет «100 промптов для Midjourney» и волшебную кнопку",
      "Тем, кто не готов выделить 4–5 часов в неделю на практику на своих проектах",
      "Тем, кто хочет остаться в роли исполнителя и не брать ответственность за результат",
    ],
  },
  pricing: {
    labelLeft: "07 / СТОИМОСТЬ",
    labelRight: "ЦЕНА ДЛЯ УЧАСТНИКОВ ЭФИРА",
    introHeading: "Что ты\nполучаешь?",
    introValue: "Полная ценность курса: 110 000 ₽.",
    valueTotalLabel: "Ценность курса",
    valueTotal: "110 000 ₽",
    valueStack: [
      {
        item: "8 модулей с практикой на твоих реальных проектах",
        price: "40 000 ₽",
      },
      { item: "Личная карта внедрения ИИ в твой процесс", price: "8 000 ₽" },
      {
        item: "Библиотека шаблонов: бриф, чек-лист аудита, сценарии для вариаций, шаблоны хендоффа",
        price: "12 000 ₽",
      },
      {
        item: "Проверенные промты для экономии лимитов",
        price: "10 000 ₽",
      },
      {
        item: "Разборы работ от куратора (персональная обратная связь)",
        price: "30 000 ₽",
      },
      { item: "Чат поддержки с ответами на любые вопросы", price: "10 000 ₽" },
      {
        item: "Три реальных рабочих кейса в портфолио",
        price: "бесценно",
        priceless: true,
      },
    ],
    offerLabel: "ЦЕНА ДЛЯ УЧАСТНИКОВ ЭФИРА",
    price: "40 000 ₽",
    priceOld: "60 000 ₽",
    discountNote: "Скидка действует до 16 ноября",
    installments: "Доступна рассрочка без переплат на 3 / 6 / 10 месяцев",
    cta: "ЗАБРАТЬ МЕСТО СО СКИДКОЙ",
    availability: "Осталось 14 мест из 20",
    deadline: "Набор закрывается 1 декабря или когда закончатся места",
  },
  final: {
    labelLeft: "08 / РЕШЕНИЕ",
    labelRight: "ОДНА КНОПКА",
    heading:
      "Ты уже знаешь, что дальше будет по-другому. Вопрос только — с какой стороны ты окажешься.",
    p1: "Через два года ты будешь либо тем дизайнером, которого заменили подпиской за 20 долларов. Либо тем, кто ведёт продукт от идеи до результата, кому доверяют сложное и платят за уровень.",
    accent:
      "Разница между этими двумя людьми — не талант. Не удача. Не связи.\nЭто 12 недель системной работы — которые начинаются с одной кнопки.",
    cta: "ЗАНЯТЬ МЕСТО НА ПОТОКЕ",
    availability: "Старт 1 декабря · Осталось 14 мест из 20",
  },
  footer: {
    tagline:
      "© AI WorkFlow — Стань незаменимым специалистом способным создать и вести проект от брифа до релиза готового продукта",
    legal: "ИП АНДРЕЙКО АРТУР ЕВГЕНЬЕВИЧ / ОГРН 309616705200021 / ИНН 616706226701",
    offerLabel: "Договор оферты",
    privacyLabel: "Политика конфиденциальности",
    topLabel: "НАВЕРХ ↑",
  },
  enroll: {
    label: "AI WORKFLOW / ПЕРВЫЙ ПОТОК",
    title: "Записаться",
    note: "Доступна беспроцентная рассрочка на 3 / 6 / 10 месяцев",
  },
  success: {
    title: "Благодарю!",
    lead: "Оплата прошла успешно!",
    body: "Все инструкции отправлены тебе на почту, указанную при регистрации.",
    start: "Стартуем 1 декабря.",
    loginLabel: "Войти в систему.",
    loginUrl:
      "https://modulesclub.getcourse.ru/teach/control/stream/view/id/935999642",
  },
};

export function mergeSiteContent(
  partial: Partial<SiteContent> | null | undefined
): SiteContent {
  if (!partial || typeof partial !== "object") return DEFAULT_CONTENT;
  return {
    ...DEFAULT_CONTENT,
    ...partial,
    nav: partial.nav ?? DEFAULT_CONTENT.nav,
    hero: { ...DEFAULT_CONTENT.hero, ...partial.hero },
    approach: {
      ...DEFAULT_CONTENT.approach,
      ...partial.approach,
      scenarioA: {
        ...DEFAULT_CONTENT.approach.scenarioA,
        ...partial.approach?.scenarioA,
        items:
          partial.approach?.scenarioA?.items ??
          DEFAULT_CONTENT.approach.scenarioA.items,
      },
      scenarioB: {
        ...DEFAULT_CONTENT.approach.scenarioB,
        ...partial.approach?.scenarioB,
        items:
          partial.approach?.scenarioB?.items ??
          DEFAULT_CONTENT.approach.scenarioB.items,
      },
    },
    market: {
      ...DEFAULT_CONTENT.market,
      ...partial.market,
      stats: partial.market?.stats ?? DEFAULT_CONTENT.market.stats,
    },
    workflow: {
      ...DEFAULT_CONTENT.workflow,
      ...partial.workflow,
      steps: partial.workflow?.steps ?? DEFAULT_CONTENT.workflow.steps,
    },
    program: {
      ...DEFAULT_CONTENT.program,
      ...partial.program,
      modules: partial.program?.modules ?? DEFAULT_CONTENT.program.modules,
    },
    proof: {
      ...DEFAULT_CONTENT.proof,
      ...partial.proof,
      stats: partial.proof?.stats ?? DEFAULT_CONTENT.proof.stats,
    },
    audience: {
      ...DEFAULT_CONTENT.audience,
      ...partial.audience,
      fit: partial.audience?.fit ?? DEFAULT_CONTENT.audience.fit,
      notFit: partial.audience?.notFit ?? DEFAULT_CONTENT.audience.notFit,
    },
    pricing: {
      ...DEFAULT_CONTENT.pricing,
      ...partial.pricing,
      valueStack:
        partial.pricing?.valueStack ?? DEFAULT_CONTENT.pricing.valueStack,
    },
    final: { ...DEFAULT_CONTENT.final, ...partial.final },
    footer: { ...DEFAULT_CONTENT.footer, ...partial.footer },
    enroll: { ...DEFAULT_CONTENT.enroll, ...partial.enroll },
    success: { ...DEFAULT_CONTENT.success, ...partial.success },
  };
}

export function lines(text: string): string[] {
  return text.split("\n");
}
