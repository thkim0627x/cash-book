package com.cashbook.domain.community.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.community.dto.*;
import com.cashbook.domain.community.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    // ───────────────────── 게시글 ─────────────────────

    /** POST /api/community/posts — 게시글 작성 (로그인 필요) */
    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostDetailResponse> createPost(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid PostCreateRequest req
    ) {
        return ApiResponse.ok("게시글이 등록되었습니다.", communityService.createPost(userId, req));
    }

    /**
     * GET /api/community/posts — 목록 (permitAll)
     * ?category=BENEFIT_REVIEW&page=0&size=20
     */
    @GetMapping("/posts")
    public ApiResponse<PostPageResponse> getPosts(
            @RequestParam(required = false)            String  category,
            @RequestParam(defaultValue = "0")          int     page,
            @RequestParam(defaultValue = "20")         int     size
    ) {
        return ApiResponse.ok(communityService.getPosts(category, page, size));
    }

    /**
     * GET /api/community/posts/{id} — 상세 (permitAll, 조회수 +1)
     * 로그인 유저면 isLiked 계산, 비로그인이면 false
     */
    @GetMapping("/posts/{id}")
    public ApiResponse<PostDetailResponse> getPostDetail(@PathVariable Long id) {
        Long userId = currentUserIdOrNull();
        return ApiResponse.ok(communityService.getPostDetail(id, userId));
    }

    /** PUT /api/community/posts/{id} — 수정 (본인만) */
    @PutMapping("/posts/{id}")
    public ApiResponse<PostDetailResponse> updatePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody @Valid PostUpdateRequest req
    ) {
        return ApiResponse.ok("게시글이 수정되었습니다.", communityService.updatePost(userId, id, req));
    }

    /** DELETE /api/community/posts/{id} — 삭제 (본인 or ADMIN, Soft Delete) */
    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> deletePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        String role = currentUserRole();
        communityService.deletePost(userId, id, role);
        return ApiResponse.ok("게시글이 삭제되었습니다.");
    }

    // ───────────────────── 댓글 ─────────────────────

    /** POST /api/community/posts/{id}/comments — 댓글 작성 */
    @PostMapping("/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommentResponse> createComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody @Valid CommentCreateRequest req
    ) {
        return ApiResponse.ok("댓글이 등록되었습니다.", communityService.createComment(userId, id, req));
    }

    /** GET /api/community/posts/{id}/comments — 댓글 목록 (permitAll) */
    @GetMapping("/posts/{id}/comments")
    public ApiResponse<CommentPageResponse> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ApiResponse.ok(communityService.getComments(id, page, size));
    }

    /** DELETE /api/community/comments/{id} — 댓글 삭제 (본인 or ADMIN) */
    @DeleteMapping("/comments/{id}")
    public ApiResponse<Void> deleteComment(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        String role = currentUserRole();
        communityService.deleteComment(userId, id, role);
        return ApiResponse.ok("댓글이 삭제되었습니다.");
    }

    // ───────────────────── 좋아요 ─────────────────────

    /** POST /api/community/posts/{id}/like — 좋아요 토글 */
    @PostMapping("/posts/{id}/like")
    public ApiResponse<LikeResponse> toggleLike(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(communityService.toggleLike(userId, id));
    }

    // ───────────────────── 내부 헬퍼 ─────────────────────

    /** 비로그인이면 null 반환 */
    private Long currentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long userId) {
            return userId;
        }
        return null;
    }

    /** 현재 유저의 role 문자열 (예: "USER", "ADMIN") */
    private String currentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) return "USER";
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("USER");
    }
}
