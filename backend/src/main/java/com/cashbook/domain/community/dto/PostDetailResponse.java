package com.cashbook.domain.community.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 게시글 상세 응답 DTO (content + isLiked 포함).
 * isLiked: SQL EXISTS 서브쿼리로 계산 (비로그인 userId=null → false).
 */
@Getter
@NoArgsConstructor
public class PostDetailResponse {
    private Long id;
    private String category;
    private String title;
    private String content;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private boolean isPinned;
    private Long authorId;
    private String authorName;
    private boolean isLiked;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
