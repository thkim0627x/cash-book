package com.cashbook.domain.community.mapper;

import com.cashbook.domain.community.dto.CommentResponse;
import com.cashbook.domain.community.dto.PostDetailResponse;
import com.cashbook.domain.community.dto.PostResponse;
import com.cashbook.domain.community.entity.CommunityComment;
import com.cashbook.domain.community.entity.CommunityPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommunityMapper {

    // ───── Post CRUD ─────

    /** 게시글 등록 */
    void insertPost(CommunityPost post);

    /**
     * 게시글 상세 조회 (users JOIN + isLiked 서브쿼리)
     * userId=null이면 isLiked=false
     */
    Optional<PostDetailResponse> findPostDetailById(
            @Param("id")     Long id,
            @Param("userId") Long userId
    );

    /**
     * 소유권/존재 확인용 단순 엔티티 조회
     */
    Optional<CommunityPost> findPostById(Long id);

    /**
     * 게시글 목록 (핀고정 먼저 + created_at DESC)
     * category=null이면 전체
     */
    List<PostResponse> findPosts(
            @Param("category") String category,
            @Param("limit")    int limit,
            @Param("offset")   int offset
    );

    long countPosts(@Param("category") String category);

    /** 제목/내용 수정 (본인 소유 검증 포함) */
    int updatePost(
            @Param("id")      Long id,
            @Param("userId")  Long userId,
            @Param("title")   String title,
            @Param("content") String content
    );

    /** Soft Delete (본인 or ADMIN) */
    int softDeletePost(@Param("id") Long id, @Param("userId") Long userId);

    /** 관리자 강제 Soft Delete (소유권 무관) */
    int adminSoftDeletePost(Long id);

    /** 조회수 +1 */
    void incrementViewCount(Long id);

    /** 핀고정 토글 (관리자) */
    void pinToggle(Long id);

    // ───── Comment ─────

    void insertComment(CommunityComment comment);

    Optional<CommunityComment> findCommentById(Long id);

    List<CommentResponse> findCommentsByPostId(
            @Param("postId") Long postId,
            @Param("limit")  int limit,
            @Param("offset") int offset
    );

    long countCommentsByPostId(Long postId);

    int softDeleteComment(@Param("id") Long id, @Param("userId") Long userId);

    int adminSoftDeleteComment(Long id);

    /** comment_count +1 */
    void incrementCommentCount(Long postId);

    /** comment_count -1 (최솟값 0 보장) */
    void decrementCommentCount(Long postId);

    // ───── Like ─────

    /**
     * 좋아요 INSERT (ON CONFLICT DO NOTHING)
     * @return 삽입된 행 수 (0 = 이미 존재)
     */
    int insertLike(@Param("postId") Long postId, @Param("userId") Long userId);

    /** 좋아요 취소 (물리 삭제) */
    int deleteLike(@Param("postId") Long postId, @Param("userId") Long userId);

    /**
     * like_count를 community_likes 실제 COUNT로 동기화
     * (race condition 안전 — 항상 정확한 값 유지)
     */
    void syncLikeCount(Long postId);

    int findLikeCount(Long postId);
}
