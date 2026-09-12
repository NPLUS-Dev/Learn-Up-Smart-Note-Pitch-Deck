// English copy for the Smart Note deck. scripts/build-deck.mjs turns ko.html
// (the Korean deck from Claude Design) into index.html with these
// replacements, and fails if one no longer matches or any Korean is left.
//
//   TEXT   — text between two tags:   >한국어<   →  >English<
//   ATTR   — whole attribute values:  ="한국어"  →  ="English"
//   RAW    — exact source snippets (markup or script), replaced verbatim
//   BLOCKS — script blocks replaced from `start` through the next `end`

const HL_GREEN = `<span style="background:linear-gradient(transparent 62%,#c8f1da 62%)">`;
const HL_VIOLET = `<span style="background:linear-gradient(transparent 62%,#e9def8 62%);color:#6b46cf">`;
const B_INK = `<b style="color:#1c2340">`;
const B_VIOLET = `<b style="color:#6b46cf">`;
const B_GREEN = `<b style="color:#2f8c63">`;

export const TEXT = [
  // Cover
  [`전세계 대상 글로벌 서비스`, `Global service, built for the world`],
  [`맞춤형 AI 학습 공간`, `Personalized AI learning space`],

  // Future of Education
  [`교육은 ${HL_VIOLET}이렇게 바뀝니다</span>`, `How education ${HL_VIOLET}will change</span>`],
  [`AI가 가르치는 일을 맡으면, 교사와 학교의 역할이 함께 움직입니다.`, `Once AI takes over the teaching, the roles of teachers and schools shift with it.`],
  [`교사`, `Teacher`],
  [`학교`, `School`],
  [`보조 도구`, `Assistant`],
  [`강의자`, `Lecturer`],
  [`조력자`, `Facilitator`],
  [`지식`, `Knowledge`],
  [`함께 사는 법`, `Living together`],
  [`설명하고 문제를 내고 채점하는 일을 AI가 맡습니다. ${B_INK}한 명마다 맞춤형 커리큘럼</b>으로 가르칠 수 있게 됩니다.`, `AI takes over explaining, setting problems, and grading — so every student can be taught with ${B_INK}a curriculum of their own</b>.`],
  [`같은 내용을 30명에게 반복하는 일에서 벗어나, ${B_INK}막힌 학생을 찾아 붙어주고 동기를 관리하는 역할</b>로 옮겨갑니다.`, `Instead of repeating the same lesson to 30 students, teachers move to ${B_INK}finding the students who are stuck, working with them, and keeping them motivated</b>.`],
  [`지식 전달은 개인화된 AI가 더 잘합니다. 학교는 ${B_INK}협업·토론·태도처럼 사람 사이에서만 배우는 것</b>을 맡습니다.`, `Personalized AI delivers knowledge better. Schools take on ${B_INK}what can only be learned between people — collaboration, debate, and attitude</b>.`],
  [`저희의 비전이 아닙니다. ${B_VIOLET}예정된 미래</b>입니다.`, `This isn't our vision. It's ${B_VIOLET}the future that's already coming</b>.`],

  // Endgame — the AI tutor
  [`맞춤형 ${HL_VIOLET}AI 튜터</span>`, `Personalized ${HL_VIOLET}AI Tutor</span>`],
  [`근본 원인 진단`, `Root-cause diagnosis`],
  [`난이도·경로 적응`, `Adapts difficulty &amp; path`],
  [`답이 아닌 소크라테스식 힌트`, `Socratic hints, not answers`],
  [`나에게 맞춰 만들어지는 콘텐츠`, `Content built around you`],
  [`학습 대시보드`, `Learning dashboard`],
  [`모든 과목을 연결`, `Connects every subject`],
  [`커리큘럼·일정`, `Curriculum · schedule`],
  [`노트가 데이터를, 데이터가 튜터를 만듭니다`, `Notes build the data; the data builds the tutor`],

  // AI Tutor (live demo)
  [`${HL_GREEN}개인화된</span> 튜터링`, `${HL_GREEN}Personalized</span> tutoring`],
  [`학습 이력, 수준, 관심사를 고려`, `Knows your learning history, level, and interests`],
  [`파편화된 지식 → 연결 및 확장`, `Scattered knowledge → connected &amp; expanded`],
  [`3D, simulation 등의 도구로 시각적 이해`, `Visual understanding through 3D &amp; simulations`],
  [`돌림힘과 회전 운동.md`, `Torque &amp; Rotational Motion.md`],
  [`↻ 다시 보기 · Replay`, `↻ Replay`],

  // Business Model
  [`개인 유저와 실사용 데이터를 먼저 확보하고, 그 데이터로 학원 B2B 계약을 추진합니다.`, `We win individual users and real usage data first, then use that data to pursue B2B contracts with academies.`],
  [`데이터`, `data`],
  [`STEM 학생`, `STEM students`],
  [`개인 유저 확보`, `Win individual users`],
  [`교사 · 강사`, `Teachers · tutors`],
  [`학원`, `Academy`],
  [`★ 프렌차이즈 대형 학원`, `★ Large franchise chains`],
  [`확장 — 시간이 오래 걸림`, `Expansion — takes time`],

  // Market
  [`가장 빠르게 자라는 ${HL_VIOLET}교육 시장</span>`, `The fastest-growing ${HL_VIOLET}education market</span>`],
  [`글로벌 에듀테크`, `Global EdTech`],
  [`AI 교육 — 가장 빠르게 성장하는 구간`, `AI education — the fastest-growing segment`],
  [`STEM 자기주도 학습자 → $22.6B`, `STEM self-directed learners → $22.6B`],
  [`≈ SAM의 1.5%`, `≈ 1.5% of SAM`],
  [`노트앱 $22.6B (2030)`, `note-taking apps $22.6B (2030)`],
  [`한국 에듀테크 $10.4B (2030)`, `South Korea EdTech $10.4B (2030)`],

  // How We Sell
  [`그래서 ${HL_VIOLET}어떻게 팔 것인가?</span>`, `So ${HL_VIOLET}how do we sell it?</span>`],
  [`AI 튜터를 따로 팔지 않습니다. 인터페이스와 묶어 ${B_INK}하나의 교육 시스템</b>으로 팝니다.`, `We don't sell the AI tutor on its own. We bundle it with the interfaces and sell ${B_INK}one education system</b>.`],
  [`이렇게 팔지 않습니다`, `Not like this`],
  [`AI 튜터를 API로 납품`, `Shipping the AI tutor as an API`],
  [`토큰 단위로 값이 매겨짐`, `Priced per token`],
  [`모델이 바뀌면 그대로 대체됨`, `Replaced as soon as models change`],
  [`하나의 교육 시스템으로 팝니다`, `Sold as one education system`],
  [`학생 인터페이스`, `Student interface`],
  [`교사 인터페이스`, `Teacher interface`],
  [`AI 튜터`, `AI Tutor`],
  [`엔진`, `Engine`],
  [`학원은 도구가 아니라 ${B_VIOLET}운영 방식</b>을 도입합니다`, `Academies adopt an ${B_VIOLET}operating model</b>, not a tool`],
  [`노트·학습 기록이 쌓여 ${B_VIOLET}바꾸기 어려워집니다</b>`, `Notes &amp; study records pile up, so it's ${B_VIOLET}hard to switch</b>`],
  [`모델 원가가 아니라 ${B_VIOLET}성과로 값이 매겨집니다</b>`, `${B_VIOLET}Priced on outcomes</b>, not model cost`],

  // Wedge
  [`${HL_GREEN}노트 앱으로 먼저</span> 시장진입`, `Enter the market ${HL_GREEN}with a note app first</span>`],
  [`왜 노트 앱이 먼저인가`, `Why the note app first`],
  [`지금 출시할 수 있습니다`, `Ships today`],
  [`경쟁자보다 먼저 시장에`, `In the market before rivals`],
  [`AI 튜터는 이미 구현돼 있습니다`, `The AI tutor is already built`],
  [`다만 아직 완벽하지는 않은 상태 — 데이터로 개선 중`, `Not perfect yet — improving with data`],
  [`타깃 — 능동적 STEM 학습자`, `Target — active STEM learners`],
  [`스스로 공부하는 고등학생 · 대학생 · 대학원생 STEM 학습자부터 시작합니다`, `We start with self-driven STEM learners — high school, college, and grad students`],
  [`왜 이 타깃인가?`, `Why this target?`],
  [`상위권이 먼저, 나머지가 따라옵니다`, `Top students first — the rest follow`],
  [`스스로 공부하는 학습자가 먼저 쓰면, 같은 반·같은 학원의 나머지가 따라옵니다. 학습 도구는 위에서 아래로 퍼집니다.`, `When self-driven learners adopt it first, the rest of their class and academy follow. Study tools spread from the top down.`],
  [`비어 있는 타깃`, `An empty target`],
  [`거의 모든 교육 앱이 “공부 안 하는 학생을 앉히는 것”을 목표로 만들어집니다. 이미 열심히 하는 학습자를 위한 도구는 비어 있습니다.`, `Almost every education app is built to “get students who won't study to sit down.” Tools for learners who already work hard just don't exist.`],
  [`STEM은 도구가 결과를 바꿉니다`, `In STEM, the tool changes the outcome`],
  [`수식·3D·시뮬레이션이 필요한 과목이라 제품의 차이가 이해도와 성적으로 바로 드러납니다 — 값을 지불할 이유가 분명합니다.`, `These subjects need equations, 3D, and simulations, so a better tool shows up directly in understanding and grades — a clear reason to pay.`],
  [`왜 지금`, `Why now`],
  [`AI가 방금 충분히 좋아졌습니다`, `AI just got good enough`],
  [`API 비용이 붕괴했습니다`, `API costs collapsed`],
  [`튜터 경쟁이 시작됐습니다`, `The tutor race is on`],

  // Smart Note — traction
  [`${HL_GREEN}이미 만들었습니다</span>`, `${HL_GREEN}Already built</span>`],
  [`베타 테스트 13주 — ${B_INK}140명</b> 가입 (9월 12일 기준)`, `13 weeks of beta — ${B_INK}140</b> sign-ups (as of Sep 12)`],
  [`누적 가입자`, `Total sign-ups`],
  [`주별 신규 가입`, `New sign-ups per week`],
  [`Supabase 실시간 데이터`, `Live data from Supabase`],
  [`Signed up users · 누적 가입`, `Signed-up users`],
  [`TTFV · 첫 가치까지 (중앙값)`, `TTFV · median time to first value`],
  [`7D feature retention · AI 생성·튜터`, `7D feature retention · AI generation &amp; tutor`],
  [`맞춤형 AI 튜터`, `Personalized AI Tutor`],
  [`작동 중 &amp; 개선 중`, `Live &amp; improving`],
  [`개발 진행 중`, `In development`],

  // Milestone
  [`3개년 ${HL_GREEN}지표와 매출 계획</span>`, `3-year ${HL_GREEN}metrics &amp; revenue plan</span>`],
  [`검증`, `Validation`],
  [`B2B · 확장`, `B2B · Scale-up`],
  [`B2G · 글로벌`, `B2G · Global`],
  [`M1 리텐션`, `M1 retention`],
  [`학원 계약 수`, `Academy contracts`],
  [`4곳 (파일럿)`, `4 (pilots)`],
  [`95곳`, `95`],
  [`490곳`, `490`],
  [`연 매출 (ARR)`, `Annual revenue (ARR)`],
  [`매출은 ${B_INK}학원 단위 라이선스</b>가 전부입니다 — 계약당 연 ${B_INK}약 $2k</b> 기준(2026은 파일럿 단가). 유저 지표는 그 계약을 만들기 위한 근거이고, The Ask의 6개월 목표(6,000 MAU · 리텐션 40%+)가 곧 2026 컬럼입니다.`, `Revenue comes entirely from ${B_INK}per-academy licenses</b> — ${B_INK}about $2k</b> per contract per year (2026 at pilot pricing). User metrics are the evidence that wins those contracts, and The Ask's 6-month goal (6,000 MAU · 40%+ retention) is the 2026 column.`],

  // Growth Loop
  [`쓰면 쓸수록 ${HL_GREEN}좋아지는 서비스</span>`, `The more it's used, ${HL_GREEN}the better it gets</span>`],
  [`학생과 교사가 서로 유저를 데려오고, 모인 유저의 데이터로 AI가 학습해 서비스가 좋아집니다.`, `Students and teachers bring each other in, and the AI learns from their data to make the service better.`],
  [`더 좋아진 서비스가 다시 유저를 데려옵니다`, `A better service brings in more users`],
  [`학생`, `Student`],
  [`서로 유저를 데려옵니다`, `Bring each other in`],
  [`유저가 모입니다`, `Users join`],
  [`학습 데이터 축적`, `Data piles up`],
  [`AI가 학습합니다`, `AI learns`],
  [`서비스가 좋아집니다`, `Service improves`],
  [`유저 → 데이터 →<br>더 똑똑한 AI → 더 많은 유저`, `Users → data →<br>smarter AI → more users`],
  [`데이터가 늘면 AI 호출이 줄고,<br>원가가 내려갑니다`, `More data means fewer AI calls<br>and lower costs`],
  [`경쟁자는 AI가 아니라<br>생태계를 복제해야 합니다`, `Rivals must clone the ecosystem,<br>not just the AI`],

  // Founder
  [`만드는 사람이 ${HL_VIOLET}사용자입니다</span>`, `The builder ${HL_VIOLET}is the user</span>`],
  [`${B_INK}과학고 재학생</b>, 2026년 7월부터 휴학하고 전념. Smart Note는 스스로 공부하고 친구들을 지켜보며 나온 제품 — ${B_INK}제가 바로 사용자입니다</b>.`, `${B_INK}Science high school student</b>, on leave since July 2026 to go all-in. Smart Note grew out of my own studying and watching my friends study — ${B_INK}I am the user</b>.`],
  [`외부 검증`, `Outside validation`],
  [`YC Co-founder Matching ${B_GREEN}6자리 오퍼</b>`, `YC Co-founder Matching ${B_GREEN}six-figure offer</b>`],
  [`${B_GREEN}10시간</b> 만에 데모 구현 → ${B_GREEN}$6,500</b> 계약 수주`, `Demo built in ${B_GREEN}10 hours</b> → ${B_GREEN}$6,500</b> contract won`],
  [`$2,450 UE5 제안`, `$2,450 UE5 offer`],
  [`9년차 풀스택 + AI`, `9 years full-stack + AI`],
  [`${B_INK}UE5·C++</b> 게임 → ${B_INK}React·Next</b> 웹 → ${B_INK}Nest·PostgreSQL</b> 서버 → ${B_INK}CI/CD·AWS</b> 인프라를 한 사람이 만들고, ${B_INK}AI — (특히 RL)</b>까지.`, `${B_INK}UE5·C++</b> games → ${B_INK}React·Next</b> web → ${B_INK}Nest·PostgreSQL</b> servers → ${B_INK}CI/CD·AWS</b> infra, built by one person — and now ${B_INK}AI (especially RL)</b>.`],
  [`로우레벨부터 CS 이론·수학까지`, `Low-level to CS theory &amp; math`],
  [`CNN 코드 한 줄을 ${B_INK}메모리 레이아웃·캐시·GPU 텐서 코어</b>까지 읽고, Quake III의 fast inverse square root를 비트 단위로 분해하며 ${B_INK}바나흐 고정점 정리</b>로 반복 정책 평가의 수렴성을 증명합니다.`, `I read a single line of CNN code down to ${B_INK}memory layout, cache, and GPU tensor cores</b>, take Quake III's fast inverse square root apart bit by bit, and prove iterative policy evaluation converges with the ${B_INK}Banach fixed-point theorem</b>.`],
  [`7년 · 9개 프로젝트 · 글로벌 팀`, `7 years · 9 projects · global teams`],
  [`누적 ${B_INK}80명 이상</b>. 대부분 외국인으로 구성된 팀을 ${B_INK}영어 회의</b>로 운영하고, 시험 기간에 팀이 흩어졌을 때 다시 모아 ${B_INK}끝까지 출시</b>했습니다.`, `${B_INK}80+ people</b> in total. I run mostly international teams in ${B_INK}English-language meetings</b>, and when exam season scattered one, I pulled it back together and ${B_INK}shipped anyway</b>.`],
  [`혼자서 제품 전체를 만들고, 데모까지 며칠이 아니라 <span style="color:#1c2340">시간 단위</span>로 냅니다`, `I build the whole product solo and ship demos in <span style="color:#1c2340">hours</span>, not days`],

  // The Ask
  [`캡 ${B_INK}15.0%</b> · 런웨이 ${B_INK}6개월</b>`, `Cap ${B_INK}15.0%</b> · Runway ${B_INK}6 months</b>`],
  [`6개월 목표`, `6-month goal`],
  [`리텐션`, `retention`],
  [`자금 사용 계획`, `Use of funds`],
  [`해낼 수 있다는 걸 증명하게 해주세요.`, `Let me prove I can.`],
];

export const ATTR = [
  // speaker notes
  [`Smart Note — AI 마크다운 학습 공간. 프리시드 SAFE 라운드.`, `Smart Note — an AI markdown learning space. Pre-seed SAFE round.`],
  [`교육 시장은 앞으로 이렇게 바뀝니다 — AI가 강의를 맡고, 교사는 조력자가 되고, 학교는 지식 전달에서 함께 사는 법을 가르치는 곳으로 이동합니다. 이 변화가 우리 제품이 서 있는 전제입니다.`, `Here's how education is going to change — AI takes over lecturing, teachers become facilitators, and schools shift from delivering knowledge to teaching how to live together. That shift is the premise our product stands on.`],
  [`라이브 데모 — 노트 맥락을 읽고 대화하며, 벡터 외적 3D 시뮬레이션과 돌림힘·회전 운동 시뮬레이션을 대화 중 직접 생성해 보여줍니다.`, `Live demo — the tutor reads the note's context, talks it through, and generates a 3D vector cross product simulation and a torque &amp; rotational motion simulation right inside the conversation.`],
  [`B2C 구독으로 시작, 학원 B2B 라이선스가 최종 목표, 학교·대학 B2G는 확장.`, `Start with B2C subscriptions; academy B2B licenses are the end goal; B2G for schools and universities is the expansion.`],
  [`TAM $348B, SAM $32B (CAGR 31.2%), SOM $0.5B — SAM의 보수적 1.5%.`, `TAM $348B, SAM $32B (CAGR 31.2%), SOM $0.5B — a conservative 1.5% of SAM.`],
  [`AI 튜터를 API로 팔지 않습니다. 인터페이스(Smart Note · Smart Board)와 묶어 하나의 교육 시스템으로 판매합니다.`, `We don't sell the AI tutor as an API. We bundle it with the interfaces (Smart Note · Smart Board) and sell it as one education system.`],
  [`노트 앱이 웨지. AI 튜터는 이미 붙어 있고 데이터로 다듬는 중. 타깃은 능동적 STEM 학습자 — 항목에 마우스를 올리면 이유가 펼쳐집니다.`, `The note app is the wedge. The AI tutor is already built in and being refined with data. The target is active STEM learners — hover over the question to reveal the reasons.`],
  [`Smart Note는 이미 11개 기능이 출시됐습니다. Smart Board는 기획 단계.`, `Smart Note has already shipped 11 features. Smart Board is in planning.`],
  [`3개년 계획 — MAU와 리텐션을 올려 학원 계약의 근거를 만들고, 2027년 본계약부터 매출이 붙어 2028년 ARR $980k를 목표로 합니다.`, `3-year plan — grow MAU and retention to build the case for academy contracts; revenue starts with full contracts in 2027, targeting $980k ARR in 2028.`],
  [`학생과 교사가 서로 유저를 데려옵니다. 유저가 모이면 학습 데이터가 쌓이고, 그 데이터로 AI가 학습해 서비스가 좋아집니다 — 그래서 다시 유저가 모입니다.`, `Students and teachers bring each other in. As users join, learning data piles up, and the AI learns from it to improve the service — which brings in more users again.`],
  [`제가 바로 사용자입니다 — 과학고 재학생, 2025년 12월부터 휴학하고 전념. 외부 검증: YC Co-founder Matching 6자리 오퍼, 10시간 만에 데모를 만들어 $6,500 계약. 8년 풀스택, 로우레벨부터 CS 이론·수학까지, 7년 9개 프로젝트를 글로벌 팀으로 운영.`, `I am the user — a science high school student, on leave since December 2025 to go all-in. Outside validation: a six-figure YC Co-founder Matching offer, and a $6,500 contract from a demo built in 10 hours. 8 years full-stack, from low-level to CS theory and math, and 9 projects over 7 years with global teams.`],
  [`$300k 프리시드 SAFE, 캡 15%, 런웨이 6개월. 목표는 5,000 MAU와 40% 이상 리텐션.`, `$300k pre-seed SAFE, 15% cap, 6-month runway. Goals: 5,000 MAU and 40%+ retention.`],

  // chart / diagram descriptions
  [`Smart Note와 Smart Board로 STEM 학생·교사 개인 유저를 확보하고, 그 실사용 데이터를 증거로 학원 B2B 계약을 추진하며, 학교·대학 B2G로 확장합니다`, `Smart Note and Smart Board win individual STEM students and teachers; their real usage data is the evidence for B2B contracts with academies, which then expand to B2G sales to schools and universities`],
  [`2026년 6월 21일 OBT 시작 이후 주별 신규 가입과 누적 가입자 그래프 — 13주 만에 누적 140명, 7월 둘째 주에 주간 34명이 최고치`, `Weekly new and cumulative sign-ups since the open beta launched on June 21, 2026 — 140 in total after 13 weeks, peaking at 34 in the second week of July`],
  [`성장 루프: 학생과 교사가 서로 유저를 데려오고, 유저가 모이면 학습 데이터가 쌓이고, 그 데이터로 AI가 학습해 서비스가 좋아지며, 다시 더 많은 유저가 모입니다`, `Growth loop: students and teachers bring each other in; as users join, learning data piles up; the AI learns from that data and the service improves, which brings in even more users`],
];

export const RAW = [
  // Business Model: the pill under "Academy" needs room for the longer label
  [`<rect x="617" y="238" width="174" height="30" rx="15" fill="#fffcf4" stroke="#6b46cf"></rect>`, `<rect x="598" y="238" width="212" height="30" rx="15" fill="#fffcf4" stroke="#6b46cf"></rect>`],

  // Market footnote (the linked source names are in TEXT)
  [`SOM = AI 교육 SAM의 보수적 1.5%, <a`, `SOM = a conservative 1.5% of the AI-education SAM, grounded in <a`],
  [`</a> 기준.</p>`, `</a>.</p>`],

  // Wedge reasons (script copy of the hover card)
  [`title: '상위권이 먼저, 나머지가 따라옵니다'`, `title: 'Top students first — the rest follow'`],
  [`detail: '스스로 공부하는 학습자가 먼저 쓰면, 같은 반·같은 학원의 나머지가 따라옵니다. 학습 도구는 위에서 아래로 퍼집니다.'`, `detail: 'When self-driven learners adopt it first, the rest of their class and academy follow. Study tools spread from the top down.'`],
  [`title: '비어 있는 타깃'`, `title: 'An empty target'`],
  [`detail: '거의 모든 교육 앱이 “공부 안 하는 학생을 앉히는 것”을 목표로 만들어집니다. 이미 열심히 하는 학습자를 위한 도구는 비어 있습니다.'`, `detail: "Almost every education app is built to “get students who won't study to sit down.” Tools for learners who already work hard just don't exist."`],
  [`title: 'STEM은 도구가 결과를 바꿉니다'`, `title: 'In STEM, the tool changes the outcome'`],
  [`detail: '수식·3D·시뮬레이션이 필요한 과목이라 제품의 차이가 성적과 이해도로 바로 드러납니다 — 값을 지불할 이유가 분명합니다.'`, `detail: 'These subjects need equations, 3D, and simulations, so a better tool shows up directly in grades and understanding — a clear reason to pay.'`],

  // The Ask: use of funds
  [`name: '팀 · 인건비'`, `name: 'Team & Payroll'`],
  [`name: '인프라 · 기술'`, `name: 'Infrastructure & Technology'`],
  [`name: '마케팅 · 유저 확보'`, `name: 'Marketing & User Acquisition'`],
  [`name: '운영 · 법무 · 회계'`, `name: 'Operations, Legal & Accounting'`],
  [`name: '예비비'`, `name: 'Buffer & Contingency'`],

  // Traction labels
  [`formula: '수식 · Formula'`, `formula: 'Formula'`],
  [`image: '이미지 · Image'`, `image: 'Image'`],
  [`diagram: '다이어그램'`, `diagram: 'Diagram'`],
  [`math_graph: '수학 그래프'`, `math_graph: 'Math graph'`],
  [`sim_2d: '2D 시뮬'`, `sim_2d: '2D sim'`],
  [`sim_3d: '3D 시뮬'`, `sim_3d: '3D sim'`],
  [`animation: '애니메이션'`, `animation: 'Animation'`],
  [`threed: '3D 모델'`, `threed: '3D model'`],
  [`ai_generation: 'AI 생성'`, `ai_generation: 'AI generation'`],
  [`tutor: 'AI 튜터'`, `tutor: 'AI tutor'`],
  [`proofread: '교정'`, `proofread: 'Proofreading'`],
  [`note: '노트'`, `note: 'Notes'`],
  [`d.signups.total + '명'`, `String(d.signups.total)`],
  [`Math.round(s) + '초'`, `Math.round(s) + ' sec'`],
  [`Math.round(s / 60) + '분'`, `Math.round(s / 60) + ' min'`],
  [`(s / 3600).toFixed(1) + '시간'`, `(s / 3600).toFixed(1) + ' hr'`],

  // AI tutor demo: simulations and chat avatar
  [`벡터 외적 3D', '드래그로 회전 · 휠로 확대'`, `3D vector cross product', 'Drag to rotate · scroll to zoom'`],
  [`'θ (a와 b의 각)'`, `'θ (angle)'`],
  [`'|b| (b의 크기)'`, `'|b| (length)'`],
  [`'°) — 외적은 항상 두 벡터에 수직입니다'`, `'°) — always perpendicular to both vectors'`],
  [`돌림힘 · 회전 운동', '드래그로 회전 · 슬라이더로 r·F 조절'`, `Torque · rotational motion', 'Drag to rotate · adjust r and F'`],
  [`'r (반지름)'`, `'r (radius)'`],
  [`'F (힘)'`, `'F (force)'`],
  [`' rad/s — τ = Iα 가 눈에 보입니다'`, `' rad/s — τ = Iα, made visible'`],
  [`av: isUser ? '나' : 'AI'`, `av: isUser ? 'Me' : 'AI'`],
  // keep formula chips like "τ = Iα" on one line — English wraps them mid-formula
  [`monospace;color:#4a76d6;background:#e8efff;padding:2px 8px;border-radius:6px"`, `monospace;color:#4a76d6;background:#e8efff;padding:2px 8px;border-radius:6px;white-space:nowrap"`],
];

export const BLOCKS = [
  {
    // AI tutor demo script — English word order needs its own runs
    start: `const CHAT = {`,
    end: `\n};\n`,
    to: `const CHAT = {
  start: {
    runs: [
      { t: "I see you're writing the " }, { t: "'Torque & Rotational Motion'", s: 'b' }, { t: ' note. The ' },
      { t: 'τ = Iα', s: 'src' }, { t: ' equation you wrote connects directly to the ' }, { t: 'vector cross product', s: 'b' },
      { t: ' you just learned. Want to see how?' }
    ],
    opts: [
      { label: 'How are they connected?', to: 'connect' },
      { label: 'Actually, torque itself still confuses me', to: 'gap' }
    ]
  },
  connect: {
    runs: [
      { t: 'Torque is the cross product ' }, { t: 'τ = r × F', s: 'src' },
      { t: ' itself. So the fastest route is to get hands-on with the ' }, { t: 'vector cross product', s: 'b' },
      { t: ' in 3D first, then move on to ' }, { t: 'torque & rotational motion', s: 'b' },
      { t: '.' }
    ],
    opts: [{ label: 'Make me a 3D cross product simulation →', to: 'gencross' }]
  },
  gencross: {
    runs: [
      { t: 'Done — I put a ' }, { t: '3D vector cross product simulation', s: 'b' },
      { t: ' right at your cursor. Drag to rotate the view and move θ. ' },
      { t: 'a × b', s: 'src' }, { t: ' is always ' }, { t: 'perpendicular', s: 'b' },
      { t: ' to both vectors, and its magnitude is ' }, { t: '|a||b|sinθ', s: 'src' }, { t: '.' }
    ],
    widget: 'cross',
    opts: [{ label: 'Now show me torque & rotational motion →', to: 'gentorque' }]
  },
  gentorque: {
    runs: [
      { t: 'I also generated a ' }, { t: 'torque & rotational motion simulation', s: 'b' },
      { t: ' in the same note. Move ' }, { t: 'r', s: 'b' }, { t: ' and ' }, { t: 'F', s: 'b' },
      { t: ' and ' }, { t: 'τ = r × F', s: 'src' },
      { t: " changes, while the disc's angular speed ω follows in real time — " },
      { t: 'τ = Iα', s: 'src' }, { t: ' becomes something you can see.' }
    ],
    widget: 'torque',
    opts: [{ label: 'I get it now, thanks', to: 'end' }]
  },
  gap: {
    runs: [
      { t: "That's fair — learners studying similar units often get stuck on " }, { t: "'how is this different from force?'", s: 'b' },
      { t: ' too. Want to tackle that question first, or go straight to a ' }, { t: 'step-by-step study plan', s: 'b' },
      { t: '?' }
    ],
    opts: [
      { label: 'Build the study plan first', to: 'plan' },
      { label: 'Explain the sticking point first →', to: 'connect' }
    ]
  },
  plan: {
    runs: [
      { t: "Here's your plan — " }, { t: 'Week 1: Force vs. torque', s: 'b' }, { t: ' → ' },
      { t: 'Week 2: Moment of inertia', s: 'b' }, { t: ' → ' }, { t: 'Week 3: Applying τ = Iα', s: 'b' },
      { t: ". Approve it and I'll add it straight to your study planner. 👍" }
    ],
    opts: []
  },
  end: {
    runs: [{ t: "Both simulations stay right in your note. This conversation drew on your profile, learning history, and the current note's context." }],
    opts: []
  }
};
`,
  },
];
