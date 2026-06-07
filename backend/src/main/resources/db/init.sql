-- ============================================================
-- assets 테이블 생성 (idempotent)
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name           VARCHAR(50)   NOT NULL,
    initial_amount BIGINT        NOT NULL DEFAULT 0,
    asset_type     VARCHAR(20)   NOT NULL DEFAULT 'ETC',
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets (user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- subscriptions 테이블 생성 (idempotent)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name           VARCHAR(50)   NOT NULL,
    start_date     DATE          NOT NULL,
    billing_cycle  VARCHAR(10)   NOT NULL DEFAULT 'MONTHLY',
    amount         BIGINT        NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- budgets/transactions/categories missing columns (idempotent)
-- ============================================================
ALTER TABLE budgets      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE budgets      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE budgets      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE categories   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE categories   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE categories   ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ============================================================
-- 기본 카테고리 이름 업데이트 (idempotent — 여러 번 실행 안전)
-- ============================================================
UPDATE categories SET name = '월급',       sort_order = 1  WHERE name = '급여'       AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '기타',       sort_order = 6  WHERE name = '기타수입'   AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '교통/차량',  sort_order = 2  WHERE name = '교통'       AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '문화생활',   sort_order = 3  WHERE name = '문화/여가'  AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '마트/편의점', sort_order = 4 WHERE name = '쇼핑'       AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '주거/통신',  sort_order = 7  WHERE name = '주거'       AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '건강',       sort_order = 8  WHERE name = '의료/건강'  AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;
UPDATE categories SET name = '기타',       sort_order = 12 WHERE name = '기타지출'   AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL;

-- 신규 기본 카테고리 추가 (없는 경우에만)
INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '상여', 'INCOME', 'Medal', '#FF9800', TRUE, 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '상여' AND type = 'INCOME' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '패션/미용', 'EXPENSE', 'TShirt', '#EC407A', TRUE, 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '패션/미용' AND type = 'EXPENSE' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '생활용품', 'EXPENSE', 'Package', '#66BB6A', TRUE, 6
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '생활용품' AND type = 'EXPENSE' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '경조사/회비', 'EXPENSE', 'Confetti', '#AB47BC', TRUE, 10
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '경조사/회비' AND type = 'EXPENSE' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '부모님', 'EXPENSE', 'Users', '#795548', TRUE, 11
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '부모님' AND type = 'EXPENSE' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

-- 이체 전용 카테고리 (이체 탭 거래 저장용)
INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '이체', 'EXPENSE', 'ArrowsLeftRight', '#607D8B', TRUE, 99
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '이체' AND type = 'EXPENSE' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

INSERT INTO categories (user_id, name, type, icon, color, is_default, sort_order)
SELECT NULL, '이체', 'INCOME', 'ArrowsLeftRight', '#607D8B', TRUE, 99
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '이체' AND type = 'INCOME' AND is_default = TRUE AND user_id IS NULL AND deleted_at IS NULL);

-- ============================================================
-- benefits 테이블 컬럼 추가 (idempotent — 여러 번 실행 안전)
-- ============================================================
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS external_id    VARCHAR(100);
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS host           VARCHAR(200);
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS benefit_summary TEXT;
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS target_income  VARCHAR(200);
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS target_region  VARCHAR(100);
ALTER TABLE benefits ADD COLUMN IF NOT EXISTS view_count     BIGINT DEFAULT 0;

-- external_id 중복 방지 인덱스 (배치 upsert용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_benefits_external_id
    ON benefits (external_id)
    WHERE external_id IS NOT NULL;

-- ============================================================
-- 시드 데이터 (직접입력 — external_id 없음)
-- 이미 동일 title + source 존재 시 건너뜀
-- ============================================================

-- 주거
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 전용 버팀목 전세자금 대출', '주거',
       '청년(만 19~34세)을 위한 전세자금 저금리 대출 지원. 보증금 3억 이하 전세 대상.',
       '주택도시기금', '최대 2억원 / 금리 연 1.5~2.1%', '부부합산 연 5천만원 이하', '전국',
       'https://nhuf.molit.go.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 전용 버팀목 전세자금 대출' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 월세 한시 특별지원', '주거',
       '저소득 청년의 주거비 부담 완화를 위해 월세를 최대 20만원씩 12개월간 지원.',
       '국토교통부', '월 최대 20만원 × 12개월', '중위소득 60% 이하', '전국',
       'https://apply.lh.or.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 월세 한시 특별지원' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 행복주택', '주거',
       '대중교통 접근성이 좋은 곳에 시세 60~80%로 공급하는 임대주택. 청년·대학생·신혼부부 대상.',
       'LH (한국토지주택공사)', '시세 대비 60~80% 임대료', '소득 기준 충족자', '전국',
       'https://apply.lh.or.kr', NULL, 19, 39, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 행복주택' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '서울시 청년 월세 지원', '주거',
       '서울 거주 청년 1인 가구에 월세 최대 20만원을 최대 10개월간 지원.',
       '서울특별시', '월 최대 20만원 × 10개월', '기준 중위소득 150% 이하', '서울',
       'https://youth.seoul.go.kr', NULL, 19, 39, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '서울시 청년 월세 지원' AND deleted_at IS NULL);

-- 금융
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년도약계좌', '금융',
       '5년간 매월 납입 시 정부 기여금 + 은행 이자 + 비과세 혜택으로 약 5천만원 자산 형성 지원.',
       '금융위원회', '5년 만기 시 약 5,000만원 / 정부 기여금 월 최대 2.4만원', '중위소득 180% 이하', '전국',
       'https://www.kinfa.or.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년도약계좌' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년희망적금', '금융',
       '2년 만기 적금으로 시중 이자 + 저축장려금(우대금리)으로 최대 36만원 추가 지원.',
       '금융위원회', '만기 시 최대 36만원 저축장려금', '총급여 3,600만원 이하', '전국',
       'https://www.kinfa.or.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년희망적금' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '중소기업 취업 청년 소득세 감면', '금융',
       '중소·중견기업에 취업한 청년에게 소득세 90%(최대 150만원)를 5년간 감면.',
       '국세청', '소득세 90% 감면 / 연 최대 150만원', '제한 없음', '전국',
       'https://www.nts.go.kr', NULL, 15, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '중소기업 취업 청년 소득세 감면' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 우대형 청약통장', '금융',
       '일반 청약저축보다 이자율 1.5%p 우대 + 이자소득 비과세(500만원 한도).',
       '국토교통부', '연 최대 3.3% 금리 / 이자 비과세', '연소득 3천6백만원 이하', '전국',
       'https://nhuf.molit.go.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 우대형 청약통장' AND deleted_at IS NULL);

-- 취업
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년내일채움공제 (2년형)', '취업',
       '중소·중견기업 취업 청년이 2년 근속 시 청년·기업·정부가 공동 적립해 목돈 마련.',
       '고용노동부', '2년 후 1,200만원 수령 (본인 400만원 납입)', '제한 없음', '전국',
       'https://www.work.go.kr', NULL, 15, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년내일채움공제 (2년형)' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '국민취업지원제도', '취업',
       '취업 취약계층 청년에게 취업 지원 서비스와 구직촉진수당을 지원하는 한국형 실업부조.',
       '고용노동부', '구직촉진수당 월 50만원 × 6개월', '중위소득 60% 이하 또는 특정 요건', '전국',
       'https://www.kua.go.kr', NULL, 15, 69, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '국민취업지원제도' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '국민내일배움카드', '취업',
       '직업훈련 수강료를 국가에서 지원. 5년간 최대 500만원 한도의 훈련비 지원.',
       '고용노동부', '최대 500만원 훈련비 지원', '제한 없음 (일부 제외)', '전국',
       'https://www.hrd.go.kr', NULL, 15, 75, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '국민내일배움카드' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 고용촉진 장려금', '취업',
       '미취업 청년을 6개월 이상 고용한 기업에 인건비 지원. 채용 청년도 간접 혜택.',
       '고용노동부', '신규 채용 청년 1인당 최대 900만원 지원', '제한 없음', '전국',
       'https://www.work.go.kr', NULL, 15, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 고용촉진 장려금' AND deleted_at IS NULL);

-- 복지
INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 마음건강 지원', '복지',
       '정신건강 취약 청년에게 전문 심리상담 서비스를 최대 10회 무료로 지원.',
       '보건복지부', '심리상담 최대 10회 무료', '제한 없음', '전국',
       'https://www.bokjiro.go.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 마음건강 지원' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 기본소득 (경기도)', '복지',
       '경기도 거주 만 24세 청년에게 지역화폐로 분기별 25만원(연 100만원) 지급.',
       '경기도', '연 100만원 지역화폐 지급', '제한 없음', '경기',
       'https://www.gg.go.kr', NULL, 24, 24, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 기본소득 (경기도)' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '문화누리카드', '복지',
       '기초생활수급자 및 차상위계층에게 문화·여행·체육활동비를 지원하는 카드 발급.',
       '문화체육관광부', '연 13만원 문화활동비 지원', '기초생활수급자 및 차상위계층', '전국',
       'https://www.munhwanuri.or.kr', NULL, NULL, NULL, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '문화누리카드' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '청년 건강검진 지원', '복지',
       '만 20~39세 청년 대상 국가건강검진 무료 실시. 일반검진 + 암검진 항목 포함.',
       '건강보험공단', '건강검진 무료 (2년 주기)', '건강보험 가입자', '전국',
       'https://www.nhis.or.kr', NULL, 20, 39, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '청년 건강검진 지원' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '서울 청년수당', '복지',
       '서울 거주 미취업 청년에게 월 50만원씩 최대 6개월간 활동비 지원.',
       '서울특별시', '월 50만원 × 최대 6개월', '기준 중위소득 150% 이하', '서울',
       'https://youth.seoul.go.kr', NULL, 19, 34, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '서울 청년수당' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '에너지 바우처', '복지',
       '취약계층 가구에 에너지(전기·도시가스·지역난방) 구입 비용을 지원.',
       '한국에너지공단', '연 최대 35만원 에너지 비용 지원', '기초생활수급자', '전국',
       'https://www.energyalliance.or.kr', NULL, NULL, NULL, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '에너지 바우처' AND deleted_at IS NULL);

INSERT INTO benefits (title, category, description, host, benefit_summary, target_income, target_region, apply_url, deadline, target_age_min, target_age_max, source)
SELECT '근로장려금 (EITC)', '금융',
       '저소득 근로자·사업자 가구에 소득에 따라 근로장려금을 지급. 청년 단독 가구 최대 165만원.',
       '국세청', '단독가구 최대 165만원 / 홑벌이 285만원', '연 소득 2,200만원 미만 (단독)', '전국',
       'https://www.nts.go.kr', NULL, 19, 75, '직접입력'
WHERE NOT EXISTS (SELECT 1 FROM benefits WHERE title = '근로장려금 (EITC)' AND deleted_at IS NULL);
