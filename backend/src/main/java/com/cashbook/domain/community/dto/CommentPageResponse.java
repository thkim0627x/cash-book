package com.cashbook.domain.community.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CommentPageResponse {
    private List<CommentResponse> content;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
}
