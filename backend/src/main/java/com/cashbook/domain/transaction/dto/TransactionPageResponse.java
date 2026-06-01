package com.cashbook.domain.transaction.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TransactionPageResponse {
    private List<TransactionResponse> content;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
}
