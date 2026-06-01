package com.cashbook.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Spring Batch 스케줄러.
 * 매일 새벽 2시에 benefitSyncJob 실행.
 *
 * ■ 매 실행마다 timestamp 파라미터 추가 → JobInstance 중복 방지
 * ■ spring.batch.job.enabled=false 설정으로 서버 시작 시 실행 방지
 */
@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job         benefitSyncJob;

    /**
     * 매일 새벽 2시 실행
     * cron: 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void runBenefitSyncJob() {
        log.info("BenefitSyncJob 스케줄 실행 시작");
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis()) // 매번 새 파라미터
                    .toJobParameters();
            jobLauncher.run(benefitSyncJob, params);
        } catch (Exception e) {
            log.error("BenefitSyncJob 실행 실패: {}", e.getMessage(), e);
        }
    }
}
