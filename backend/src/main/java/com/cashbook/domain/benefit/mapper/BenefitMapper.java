package com.cashbook.domain.benefit.mapper;

import com.cashbook.domain.benefit.dto.BenefitDetailResponse;
import com.cashbook.domain.benefit.dto.BenefitResponse;
import com.cashbook.domain.benefit.entity.Benefit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BenefitMapper {

    List<BenefitResponse> findAll(
            @Param("category")       String category,
            @Param("age")            Integer age,
            @Param("includeExpired") boolean includeExpired,
            @Param("limit")          int limit,
            @Param("offset")         int offset
    );

    long countAll(
            @Param("category")       String category,
            @Param("age")            Integer age,
            @Param("includeExpired") boolean includeExpired
    );

    Optional<BenefitDetailResponse> findById(Long id);

    List<BenefitResponse> findRecommended(@Param("age") int age);

    /** 외부 API 데이터 일괄 upsert (external_id 기준 중복 방지) */
    void batchUpsert(@Param("list") List<Benefit> benefits);

    /** 마감 지난 혜택 soft delete */
    int softDeleteExpired();
}
