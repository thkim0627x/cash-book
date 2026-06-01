package com.cashbook.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Spring Batch Job 설정.
 *
 * ■ Job: benefitSyncJob
 *   └─ Step: benefitSyncStep
 *         └─ Tasklet: BenefitSyncTasklet (현재 stub)
 *
 * ■ Spring Boot 3.x: @EnableBatchProcessing 불필요 (auto-configured)
 * ■ spring.batch.job.enabled=false → 서버 시작 시 자동 실행 방지
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class BenefitSyncJobConfig {

    private final BenefitSyncTasklet benefitSyncTasklet;

    @Bean
    public Job benefitSyncJob(JobRepository jobRepository,
                               Step benefitSyncStep) {
        return new JobBuilder("benefitSyncJob", jobRepository)
                .start(benefitSyncStep)
                .build();
    }

    @Bean
    public Step benefitSyncStep(JobRepository jobRepository,
                                 PlatformTransactionManager transactionManager) {
        return new StepBuilder("benefitSyncStep", jobRepository)
                .tasklet(benefitSyncTasklet, transactionManager)
                .build();
    }
}
