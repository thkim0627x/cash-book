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
}
