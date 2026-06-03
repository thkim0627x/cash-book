package com.cashbook.domain.community.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 게시글 목록 응답 DTO (content 제외 — 상세에서만 제공).
 * MyBatis resultMap 직접 매핑 → @NoArgsConstructor 필수.
 */
@Getter
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String category;
    private String title;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private boolean isPinned;
    private Long authorId;
    private String authorName;
    private OffsetDateTime createdAt;
}
