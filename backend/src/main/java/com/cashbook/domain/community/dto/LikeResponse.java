package com.cashbook.domain.community.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 좋아요 토글 응답.
 * liked: 토글 후 상태 (true=좋아요 누름, false=취소됨)
 * likeCount: 현재 총 좋아요 수
 */
@Getter
@Builder
public class LikeResponse {
    private boolean liked;
    private int likeCount;
}
