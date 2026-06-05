-- ============================================================
-- PlanDay (cash-book) — Supabase 전체 스키마
-- Supabase SQL Editor에 전체 붙여넣기 후 실행
-- ============================================================

-- ── 1. users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL    PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    birth_year  INT,
    role        VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ── 2. refresh_tokens ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL UNIQUE REFERENCES users(id),
    token       TEXT         NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 3. categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       REFERENCES users(id),
    name        VARCHAR(50)  NOT NULL,
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
    icon        VARCHAR(50),
    color       VARCHAR(20),
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ── 4. transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id           BIGSERIAL      PRIMARY KEY,
    user_id      BIGINT         NOT NULL REFERENCES users(id),
    category_id  BIGINT         NOT NULL REFERENCES categories(id),
    type         VARCHAR(10)    NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
    amount       DECIMAL(19,2)  NOT NULL,
    memo         TEXT,
    txn_date     DATE           NOT NULL,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

-- ── 5. budgets ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id           BIGSERIAL      PRIMARY KEY,
    user_id      BIGINT         NOT NULL REFERENCES users(id),
    category_id  BIGINT         REFERENCES categories(id),
    amount       DECIMAL(19,2)  NOT NULL,
    year_month   VARCHAR(7)     NOT NULL,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ,
    UNIQUE NULLS NOT DISTINCT (user_id, category_id, year_month)
);

-- ── 6. community_posts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id),
    category      VARCHAR(50),
    title         VARCHAR(200) NOT NULL,
    content       TEXT         NOT NULL,
    view_count    INT          NOT NULL DEFAULT 0,
    like_count    INT          NOT NULL DEFAULT 0,
    comment_count INT          NOT NULL DEFAULT 0,
    is_pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

-- ── 7. community_comments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_comments (
    id          BIGSERIAL    PRIMARY KEY,
    post_id     BIGINT       NOT NULL REFERENCES community_posts(id),
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    content     TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ── 8. community_likes ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_likes (
    post_id  BIGINT NOT NULL REFERENCES community_posts(id),
    user_id  BIGINT NOT NULL REFERENCES users(id),
    PRIMARY KEY (post_id, user_id)
);

-- ── 9. notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 10. user_conditions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_conditions (
    id                BIGSERIAL   PRIMARY KEY,
    user_id           BIGINT      NOT NULL UNIQUE REFERENCES users(id),
    income_level      VARCHAR(20),
    employment_status VARCHAR(20),
    region            VARCHAR(50),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. benefits ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS benefits (
    id              BIGSERIAL    PRIMARY KEY,
    external_id     VARCHAR(100) UNIQUE,
    title           VARCHAR(200) NOT NULL,
    category        VARCHAR(20),
    target_age_min  SMALLINT,
    target_age_max  SMALLINT,
    description     TEXT,
    host            VARCHAR(200),
    benefit_summary TEXT,
    target_income   VARCHAR(200),
    target_region   VARCHAR(100),
    apply_url       VARCHAR(500),
    deadline        DATE,
    source          VARCHAR(50),
    view_count      BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- ── Spring Batch 메타 테이블 ──────────────────────────────────
CREATE TABLE IF NOT EXISTS BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID BIGINT       NOT NULL PRIMARY KEY,
    VERSION         BIGINT,
    JOB_NAME        VARCHAR(100) NOT NULL,
    JOB_KEY         VARCHAR(32)  NOT NULL,
    UNIQUE (JOB_NAME, JOB_KEY)
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID  BIGINT        NOT NULL PRIMARY KEY,
    VERSION           BIGINT,
    JOB_INSTANCE_ID   BIGINT        NOT NULL REFERENCES BATCH_JOB_INSTANCE(JOB_INSTANCE_ID),
    CREATE_TIME       TIMESTAMP     NOT NULL,
    START_TIME        TIMESTAMP,
    END_TIME          TIMESTAMP,
    STATUS            VARCHAR(10),
    EXIT_CODE         VARCHAR(2500),
    EXIT_MESSAGE      VARCHAR(2500),
    LAST_UPDATED      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_EXECUTION_PARAMS (
    JOB_EXECUTION_ID BIGINT       NOT NULL REFERENCES BATCH_JOB_EXECUTION(JOB_EXECUTION_ID),
    PARAMETER_NAME   VARCHAR(100) NOT NULL,
    PARAMETER_TYPE   VARCHAR(100) NOT NULL,
    PARAMETER_VALUE  VARCHAR(2500),
    IDENTIFYING      CHAR(1)      NOT NULL
);

CREATE TABLE IF NOT EXISTS BATCH_STEP_EXECUTION (
    STEP_EXECUTION_ID  BIGINT        NOT NULL PRIMARY KEY,
    VERSION            BIGINT        NOT NULL,
    STEP_NAME          VARCHAR(100)  NOT NULL,
    JOB_EXECUTION_ID   BIGINT        NOT NULL REFERENCES BATCH_JOB_EXECUTION(JOB_EXECUTION_ID),
    CREATE_TIME        TIMESTAMP     NOT NULL,
    START_TIME         TIMESTAMP,
    END_TIME           TIMESTAMP,
    STATUS             VARCHAR(10),
    COMMIT_COUNT       BIGINT,
    READ_COUNT         BIGINT,
    FILTER_COUNT       BIGINT,
    WRITE_COUNT        BIGINT,
    READ_SKIP_COUNT    BIGINT,
    WRITE_SKIP_COUNT   BIGINT,
    PROCESS_SKIP_COUNT BIGINT,
    ROLLBACK_COUNT     BIGINT,
    EXIT_CODE          VARCHAR(2500),
    EXIT_MESSAGE       VARCHAR(2500),
    LAST_UPDATED       TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BATCH_STEP_EXECUTION_CONTEXT (
    STEP_EXECUTION_ID  BIGINT        NOT NULL PRIMARY KEY REFERENCES BATCH_STEP_EXECUTION(STEP_EXECUTION_ID),
    SHORT_CONTEXT      VARCHAR(2500) NOT NULL,
    SERIALIZED_CONTEXT TEXT
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_EXECUTION_CONTEXT (
    JOB_EXECUTION_ID   BIGINT        NOT NULL PRIMARY KEY REFERENCES BATCH_JOB_EXECUTION(JOB_EXECUTION_ID),
    SHORT_CONTEXT      VARCHAR(2500) NOT NULL,
    SERIALIZED_CONTEXT TEXT
);

CREATE SEQUENCE IF NOT EXISTS BATCH_STEP_EXECUTION_SEQ MAXVALUE 9223372036854775807 NO CYCLE;
CREATE SEQUENCE IF NOT EXISTS BATCH_JOB_EXECUTION_SEQ  MAXVALUE 9223372036854775807 NO CYCLE;
CREATE SEQUENCE IF NOT EXISTS BATCH_JOB_SEQ             MAXVALUE 9223372036854775807 NO CYCLE;

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, txn_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_budgets_user_month     ON budgets(user_id, year_month)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created          ON community_posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id, is_read);
CREATE UNIQUE INDEX IF NOT EXISTS idx_benefits_ext_id ON benefits(external_id)           WHERE external_id IS NOT NULL;

-- ============================================================
-- 기본 카테고리 시드 데이터
-- ============================================================
INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order) VALUES
  (NULL, '급여',       'INCOME',  'Wallet',        '#4CAF50', TRUE, 1),
  (NULL, '부수입',      'INCOME',  'PiggyBank',     '#8BC34A', TRUE, 2),
  (NULL, '용돈',        'INCOME',  'Gift',          '#CDDC39', TRUE, 3),
  (NULL, '금융소득',    'INCOME',  'TrendUp',       '#00BCD4', TRUE, 4),
  (NULL, '기타수입',    'INCOME',  'Plus',          '#9E9E9E', TRUE, 5),
  (NULL, '식비',        'EXPENSE', 'ForkKnife',     '#FF5722', TRUE, 1),
  (NULL, '교통',        'EXPENSE', 'Car',           '#2196F3', TRUE, 2),
  (NULL, '주거',        'EXPENSE', 'House',         '#795548', TRUE, 3),
  (NULL, '의료/건강',   'EXPENSE', 'Heart',         '#E91E63', TRUE, 4),
  (NULL, '쇼핑',        'EXPENSE', 'ShoppingCart',  '#9C27B0', TRUE, 5),
  (NULL, '문화/여가',   'EXPENSE', 'GameController','#FF9800', TRUE, 6),
  (NULL, '교육',        'EXPENSE', 'BookOpen',      '#3F51B5', TRUE, 7),
  (NULL, '통신',        'EXPENSE', 'Phone',         '#009688', TRUE, 8),
  (NULL, '보험',        'EXPENSE', 'Shield',        '#607D8B', TRUE, 9),
  (NULL, '적금/투자',   'EXPENSE', 'ChartLine',     '#00BCD4', TRUE, 10),
  (NULL, '기타지출',    'EXPENSE', 'DotsThree',     '#9E9E9E', TRUE, 11)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 청년혜택 시드 데이터 (20개)
-- ============================================================

-- 주거
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source) VALUES
('청년 전용 버팀목 전세자금 대출', '주거',
 '청년(만 19~34세)을 위한 전세자금 저금리 대출 지원. 보증금 3억 이하 전세 대상.',
 '주택도시기금', '최대 2억원 / 금리 연 1.5~2.1%', '부부합산 연 5천만원 이하', '전국',
 'https://nhuf.molit.go.kr', NULL, 19, 34, '직접입력'),

('청년 월세 한시 특별지원', '주거',
 '저소득 청년의 주거비 부담 완화를 위해 월세를 최대 20만원씩 12개월간 지원.',
 '국토교통부', '월 최대 20만원 × 12개월', '중위소득 60% 이하', '전국',
 'https://apply.lh.or.kr', NULL, 19, 34, '직접입력'),

('청년 행복주택', '주거',
 '대중교통 접근성이 좋은 곳에 시세 60~80%로 공급하는 임대주택.',
 'LH (한국토지주택공사)', '시세 대비 60~80% 임대료', '소득 기준 충족자', '전국',
 'https://apply.lh.or.kr', NULL, 19, 39, '직접입력'),

('서울시 청년 월세 지원', '주거',
 '서울 거주 청년 1인 가구에 월세 최대 20만원을 최대 10개월간 지원.',
 '서울특별시', '월 최대 20만원 × 10개월', '기준 중위소득 150% 이하', '서울',
 'https://youth.seoul.go.kr', NULL, 19, 39, '직접입력')

ON CONFLICT DO NOTHING;

-- 금융
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source) VALUES
('청년도약계좌', '금융',
 '5년간 매월 납입 시 정부 기여금 + 은행 이자 + 비과세 혜택으로 약 5천만원 자산 형성 지원.',
 '금융위원회', '5년 만기 시 약 5,000만원 / 정부 기여금 월 최대 2.4만원', '중위소득 180% 이하', '전국',
 'https://www.kinfa.or.kr', NULL, 19, 34, '직접입력'),

('청년희망적금', '금융',
 '2년 만기 적금으로 시중 이자 + 저축장려금으로 최대 36만원 추가 지원.',
 '금융위원회', '만기 시 최대 36만원 저축장려금', '총급여 3,600만원 이하', '전국',
 'https://www.kinfa.or.kr', NULL, 19, 34, '직접입력'),

('중소기업 취업 청년 소득세 감면', '금융',
 '중소·중견기업에 취업한 청년에게 소득세 90%(최대 150만원)를 5년간 감면.',
 '국세청', '소득세 90% 감면 / 연 최대 150만원', '제한 없음', '전국',
 'https://www.nts.go.kr', NULL, 15, 34, '직접입력'),

('청년 우대형 청약통장', '금융',
 '일반 청약저축보다 이자율 1.5%p 우대 + 이자소득 비과세(500만원 한도).',
 '국토교통부', '연 최대 3.3% 금리 / 이자 비과세', '연소득 3,600만원 이하', '전국',
 'https://nhuf.molit.go.kr', NULL, 19, 34, '직접입력'),

('근로장려금 (EITC)', '금융',
 '저소득 근로자·사업자 가구에 소득에 따라 근로장려금을 지급.',
 '국세청', '단독가구 최대 165만원 / 홑벌이 285만원', '연 소득 2,200만원 미만 (단독)', '전국',
 'https://www.nts.go.kr', NULL, 19, 75, '직접입력')

ON CONFLICT DO NOTHING;

-- 취업
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source) VALUES
('청년내일채움공제 (2년형)', '취업',
 '중소·중견기업 취업 청년이 2년 근속 시 청년·기업·정부가 공동 적립해 목돈 마련.',
 '고용노동부', '2년 후 1,200만원 수령 (본인 400만원 납입)', '제한 없음', '전국',
 'https://www.work.go.kr', NULL, 15, 34, '직접입력'),

('국민취업지원제도', '취업',
 '취업 취약계층 청년에게 취업 지원 서비스와 구직촉진수당을 지원하는 한국형 실업부조.',
 '고용노동부', '구직촉진수당 월 50만원 × 6개월', '중위소득 60% 이하 또는 특정 요건', '전국',
 'https://www.kua.go.kr', NULL, 15, 69, '직접입력'),

('국민내일배움카드', '취업',
 '직업훈련 수강료를 국가에서 지원. 5년간 최대 500만원 한도의 훈련비 지원.',
 '고용노동부', '최대 500만원 훈련비 지원', '제한 없음 (일부 제외)', '전국',
 'https://www.hrd.go.kr', NULL, 15, 75, '직접입력'),

('청년 고용촉진 장려금', '취업',
 '미취업 청년을 고용한 기업에 인건비 지원. 채용 청년도 간접 혜택.',
 '고용노동부', '신규 채용 청년 1인당 최대 900만원 지원', '제한 없음', '전국',
 'https://www.work.go.kr', NULL, 15, 34, '직접입력')

ON CONFLICT DO NOTHING;

-- 복지
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source) VALUES
('청년 마음건강 지원', '복지',
 '정신건강 취약 청년에게 전문 심리상담 서비스를 최대 10회 무료로 지원.',
 '보건복지부', '심리상담 최대 10회 무료', '제한 없음', '전국',
 'https://www.bokjiro.go.kr', NULL, 19, 34, '직접입력'),

('청년 기본소득 (경기도)', '복지',
 '경기도 거주 만 24세 청년에게 지역화폐로 분기별 25만원(연 100만원) 지급.',
 '경기도', '연 100만원 지역화폐 지급', '제한 없음', '경기',
 'https://www.gg.go.kr', NULL, 24, 24, '직접입력'),

('문화누리카드', '복지',
 '기초생활수급자 및 차상위계층에게 문화·여행·체육활동비를 지원하는 카드 발급.',
 '문화체육관광부', '연 13만원 문화활동비 지원', '기초생활수급자 및 차상위계층', '전국',
 'https://www.munhwanuri.or.kr', NULL, NULL, NULL, '직접입력'),

('청년 건강검진 지원', '복지',
 '만 20~39세 청년 대상 국가건강검진 무료 실시. 일반검진 + 암검진 항목 포함.',
 '건강보험공단', '건강검진 무료 (2년 주기)', '건강보험 가입자', '전국',
 'https://www.nhis.or.kr', NULL, 20, 39, '직접입력'),

('서울 청년수당', '복지',
 '서울 거주 미취업 청년에게 월 50만원씩 최대 6개월간 활동비 지원.',
 '서울특별시', '월 50만원 × 최대 6개월', '기준 중위소득 150% 이하', '서울',
 'https://youth.seoul.go.kr', NULL, 19, 34, '직접입력'),

('에너지 바우처', '복지',
 '취약계층 가구에 에너지 구입 비용을 지원.',
 '한국에너지공단', '연 최대 35만원 에너지 비용 지원', '기초생활수급자', '전국',
 'https://www.energyalliance.or.kr', NULL, NULL, NULL, '직접입력'),

('스포츠강좌이용권', '복지',
 '저소득층 청소년·청년에게 체육시설 이용권을 지원해 건강한 생활습관 형성 도모.',
 '문화체육관광부', '월 최대 8.5만원 스포츠 강좌 이용권', '기초생활수급자 및 차상위계층', '전국',
 'https://www.svoucher.or.kr', NULL, 5, 18, '직접입력')

ON CONFLICT DO NOTHING;
