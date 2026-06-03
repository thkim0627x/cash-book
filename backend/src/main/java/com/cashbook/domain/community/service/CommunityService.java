package com.cashbook.domain.community.service;

import com.cashbook.domain.community.dto.*;
import com.cashbook.domain.community.entity.CommunityComment;
import com.cashbook.domain.community.entity.CommunityPost;
import com.cashbook.domain.community.mapper.CommunityMapper;
import com.cashbook.domain.notification.service.NotificationService;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private static final Set<String> VALID_CATEGORIES =
            Set.of("BENEFIT_REVIEW", "SAVING_TIP", "QA", "FREE");

    private final CommunityMapper communityMapper;
    private final NotificationService notificationService;

    // ══════════════════════════════════════════════════
    // 게시글
    // ══════════════════════════════════════════════════

    /** 게시글 작성 */
    @Transactional
    public PostDetailResponse createPost(Long userId, PostCreateRequest req) {
        validateCategory(req.getCategory());

        CommunityPost post = CommunityPost.builder()
                .userId(userId)
                .category(req.getCategory())
                .title(req.getTitle())
                .content(req.getContent())
                .build();
        communityMapper.insertPost(post);

        return communityMapper.findPostDetailById(post.getId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    /** 게시글 목록 조회 (핀고정 먼저, category 필터) */
    @Transactional(readOnly = true)
    public PostPageResponse getPosts(String category, int page, int size) {
        if (category != null && !VALID_CATEGORIES.contains(category)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "유효하지 않은 카테고리입니다.");
        }
        int offset = page * size;
        List<PostResponse> content = communityMapper.findPosts(category, size, offset);
        long totalCount = communityMapper.countPosts(category);
        return PostPageResponse.builder()
                .content(content)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .totalPages((int) Math.ceil((double) totalCount / size))
                .build();
    }

    /**
     * 게시글 상세 조회 + 조회수 +1.
     * userId=null 허용 (비로그인) → isLiked=false.
     */
    @Transactional
    public PostDetailResponse getPostDetail(Long postId, Long userId) {
        PostDetailResponse detail = communityMapper.findPostDetailById(postId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        communityMapper.incrementViewCount(postId);
        return detail;
    }

    /** 게시글 수정 (본인만) */
    @Transactional
    public PostDetailResponse updatePost(Long userId, Long postId, PostUpdateRequest req) {
        // 존재 확인
        communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        int updated = communityMapper.updatePost(postId, userId, req.getTitle(), req.getContent());
        if (updated == 0) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return communityMapper.findPostDetailById(postId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    }

    /** 게시글 삭제 (본인 or ADMIN) */
    @Transactional
    public void deletePost(Long userId, Long postId, String role) {
        CommunityPost post = communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if ("ADMIN".equals(role)) {
            communityMapper.adminSoftDeletePost(postId);
        } else {
            if (!post.getUserId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
            int deleted = communityMapper.softDeletePost(postId, userId);
            if (deleted == 0) throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
    }

    // ══════════════════════════════════════════════════
    // 댓글
    // ══════════════════════════════════════════════════

    /**
     * 댓글 작성 + 게시글 comment_count++ + 글 작성자에게 알림.
     * 자기 게시글에 본인이 댓글 달면 알림 미전송.
     */
    @Transactional
    public CommentResponse createComment(Long userId, Long postId, CommentCreateRequest req) {
        CommunityPost post = communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        CommunityComment comment = CommunityComment.builder()
                .postId(postId)
                .userId(userId)
                .content(req.getContent())
                .build();
        communityMapper.insertComment(comment);
        communityMapper.incrementCommentCount(postId);

        // 글 작성자 ≠ 댓글 작성자일 때만 알림 전송
        if (!post.getUserId().equals(userId)) {
            notificationService.create(
                    post.getUserId(),
                    "COMMUNITY_COMMENT",
                    "새 댓글이 달렸습니다.",
                    "'" + truncate(post.getTitle(), 30) + "'에 댓글이 달렸습니다.",
                    "/community/" + postId
            );
        }

        return communityMapper.findCommentsByPostId(postId, 1, 0).stream()
                .filter(c -> c.getId().equals(comment.getId()))
                .findFirst()
                .orElseThrow();
    }

    /** 댓글 목록 조회 (created_at ASC) */
    @Transactional(readOnly = true)
    public CommentPageResponse getComments(Long postId, int page, int size) {
        // 게시글 존재 확인
        communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        int offset = page * size;
        List<CommentResponse> content = communityMapper.findCommentsByPostId(postId, size, offset);
        long totalCount = communityMapper.countCommentsByPostId(postId);
        return CommentPageResponse.builder()
                .content(content)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .totalPages((int) Math.ceil((double) totalCount / size))
                .build();
    }

    /** 댓글 삭제 (본인 or ADMIN) + comment_count-- */
    @Transactional
    public void deleteComment(Long userId, Long commentId, String role) {
        CommunityComment comment = communityMapper.findCommentById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if ("ADMIN".equals(role)) {
            communityMapper.adminSoftDeleteComment(commentId);
        } else {
            if (!comment.getUserId().equals(userId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
            int deleted = communityMapper.softDeleteComment(commentId, userId);
            if (deleted == 0) throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }
        communityMapper.decrementCommentCount(comment.getPostId());
    }

    // ══════════════════════════════════════════════════
    // 좋아요 토글
    // ══════════════════════════════════════════════════

    /**
     * 좋아요 토글.
     * insertLike → 0행(이미 존재) → deleteLike.
     * syncLikeCount로 항상 정확한 count 유지.
     */
    @Transactional
    public LikeResponse toggleLike(Long userId, Long postId) {
        communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        int inserted = communityMapper.insertLike(postId, userId);
        boolean liked;
        if (inserted > 0) {
            liked = true;
        } else {
            communityMapper.deleteLike(postId, userId);
            liked = false;
        }
        communityMapper.syncLikeCount(postId);
        int likeCount = communityMapper.findLikeCount(postId);

        return LikeResponse.builder()
                .liked(liked)
                .likeCount(likeCount)
                .build();
    }

    // ══════════════════════════════════════════════════
    // 관리자
    // ══════════════════════════════════════════════════

    /** 핀고정 토글 (ADMIN 전용) */
    @Transactional
    public void pinToggle(Long postId) {
        communityMapper.findPostById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        communityMapper.pinToggle(postId);
    }

    // ══════════════════════════════════════════════════
    // 내부 헬퍼
    // ══════════════════════════════════════════════════

    private void validateCategory(String category) {
        if (!VALID_CATEGORIES.contains(category)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "유효하지 않은 카테고리입니다. (BENEFIT_REVIEW | SAVING_TIP | QA | FREE)");
        }
    }

    private String truncate(String s, int max) {
        return s != null && s.length() > max ? s.substring(0, max) + "..." : s;
    }
}
