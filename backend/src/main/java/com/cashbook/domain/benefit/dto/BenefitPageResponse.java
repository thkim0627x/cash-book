package com.cashbook.domain.benefit.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BenefitPageResponse {
    private List<BenefitResponse> content;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;

    /** 프론트엔드 호환용 alias */
    public long getTotalElements() {
        return this.totalCount;
    }
}
