package com.cashbook.batch;

import com.cashbook.domain.benefit.entity.Benefit;
import com.cashbook.domain.benefit.mapper.BenefitMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 온통청년(youth.go.kr) API에서 청년 정책 데이터를 동기화합니다.
 *
 * API 키 발급: https://www.youthcenter.go.kr/main.do (오픈 API 신청)
 * 환경변수 YOUTH_API_KEY 에 발급받은 키를 설정하세요.
 * 키 미설정 시 외부 API 호출을 건너뜁니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BenefitSyncTasklet implements Tasklet {

    private static final String YOUTH_API_URL =
            "https://www.youthcenter.go.kr/youngPlcyUnif/youngPlcyUnifList.do";
    private static final int PAGE_SIZE = 100;

    // 온통청년 카테고리 코드 → 내부 카테고리 매핑
    private static final Map<String, String> CATEGORY_MAP = Map.of(
            "023010", "취업",   // 일자리
            "023020", "주거",   // 주거
            "023030", "복지",   // 복지/문화
            "023040", "복지",   // 참여/권리
            "023050", "금융",   // 생활비/금융
            "023060", "취업"    // 창업
    );

    @Value("${youth.api.key:}")
    private String youthApiKey;

    private final BenefitMapper benefitMapper;
    private final ObjectMapper  objectMapper;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        log.info("===== BenefitSyncJob 시작 =====");

        if (youthApiKey == null || youthApiKey.isBlank()) {
            log.warn("YOUTH_API_KEY 미설정 — 외부 API 동기화 건너뜀. " +
                     "youth.go.kr에서 API 키를 발급 후 설정하세요.");
            return RepeatStatus.FINISHED;
        }

        try {
            List<Benefit> benefits = fetchAllPages();
            if (!benefits.isEmpty()) {
                benefitMapper.batchUpsert(benefits);
                log.info("혜택 데이터 upsert 완료: {}건", benefits.size());
            }

            int deleted = benefitMapper.softDeleteExpired();
            log.info("만료 혜택 soft delete: {}건", deleted);

        } catch (Exception e) {
            log.error("BenefitSyncJob 실패: {}", e.getMessage(), e);
        }

        log.info("===== BenefitSyncJob 완료 =====");
        return RepeatStatus.FINISHED;
    }

    private List<Benefit> fetchAllPages() throws Exception {
        List<Benefit> result = new ArrayList<>();
        RestClient client = RestClient.create();
        int pageIndex = 1;

        while (true) {
            String json = client.get()
                    .uri(YOUTH_API_URL + "?openApiVlak={key}&pageIndex={page}&pageSize={size}",
                            youthApiKey, pageIndex, PAGE_SIZE)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(json);
            JsonNode policyNode = root.path("youthPolicy");
            JsonNode list = policyNode.path("list");

            if (!list.isArray() || list.isEmpty()) break;

            for (JsonNode item : list) {
                Benefit benefit = mapToBenefit(item);
                if (benefit != null) result.add(benefit);
            }

            long totalCount = policyNode.path("totCnt").asLong(0);
            if ((long) pageIndex * PAGE_SIZE >= totalCount) break;
            pageIndex++;
        }

        return result;
    }

    private Benefit mapToBenefit(JsonNode item) {
        try {
            String externalId = item.path("plcyNo").asText("");
            if (externalId.isBlank()) return null;

            String categoryCode = item.path("srchPolyBizSecd").asText("023010");
            String category = CATEGORY_MAP.getOrDefault(categoryCode, "복지");

            String deadlineStr = item.path("bizPrdEndDt").asText("");
            LocalDate deadline = parseDeadline(deadlineStr);

            short minAge = (short) item.path("minAge").asInt(0);
            short maxAge = (short) item.path("maxAge").asInt(0);

            return Benefit.builder()
                    .externalId(externalId)
                    .title(truncate(item.path("plcyNm").asText(""), 200))
                    .category(category)
                    .description(truncate(item.path("plcyItcnCn").asText(""), 2000))
                    .host(truncate(item.path("sprvInstNm").asText(""), 200))
                    .benefitSummary(truncate(item.path("plcySptCn").asText(""), 500))
                    .targetIncome(truncate(item.path("incomeInfo").asText(""), 200))
                    .targetRegion(null) // 전국 혜택 (지역 필터는 별도)
                    .applyUrl(truncate(item.path("plcyUrl").asText(""), 500))
                    .deadline(deadline)
                    .targetAgeMin(minAge > 0 ? minAge : null)
                    .targetAgeMax(maxAge > 0 ? maxAge : null)
                    .source("온통청년")
                    .build();
        } catch (Exception e) {
            log.warn("혜택 항목 파싱 실패: {}", e.getMessage());
            return null;
        }
    }

    private LocalDate parseDeadline(String dateStr) {
        if (dateStr == null || dateStr.isBlank() || dateStr.equals("상시")) return null;
        try {
            // yyyyMMdd 또는 yyyy-MM-dd 형식
            String cleaned = dateStr.replaceAll("[^0-9]", "");
            if (cleaned.length() == 8) {
                return LocalDate.parse(cleaned, DateTimeFormatter.BASIC_ISO_DATE);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
