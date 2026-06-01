package com.cashbook.batch;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

/**
 * 혜택 데이터 동기화 Tasklet.
 *
 * 현재 단계: 기초 구조만 세팅 (실제 외부 API 연동은 다음 단계)
 *
 * 다음 단계에서 구현할 내용:
 * - 온통청년 API / 복지로 API 호출
 * - 응답 데이터 파싱 → benefits 테이블 upsert
 * - 만료 데이터 Soft Delete
 */
@Slf4j
@Component
public class BenefitSyncTasklet implements Tasklet {

    @Override
    public RepeatStatus execute(StepContribution contribution,
                                ChunkContext chunkContext) {
        log.info("===== BenefitSyncJob 시작 =====");
        log.info("TODO: 외부 API 연동 구현 예정");
        // ─────────────────────────────────────
        // Phase 5에서 구현 예정:
        //   1. 온통청년 API 호출 (WebClient 또는 RestTemplate)
        //   2. 복지로 API 호출
        //   3. 응답 파싱 → BenefitMapper.batchInsertOrUpdate()
        //   4. 마감 지난 혜택 Soft Delete
        // ─────────────────────────────────────
        log.info("===== BenefitSyncJob 완료 (stub) =====");
        return RepeatStatus.FINISHED;
    }
}
