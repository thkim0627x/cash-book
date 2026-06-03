package com.cashbook.domain.community.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 전용 커뮤니티 관리 API.
 * /api/admin/** → SecurityConfig에서 ADMIN 롤 필수로 설정됨.
 */
@RestController
@RequestMapping("/api/admin/community")
@RequiredArgsConstructor
public class AdminCommunityController {

    private final CommunityService communityService;

    /**
     * PATCH /api/admin/community/posts/{id}/pin — 핀고정 토글
     * true ↔ false 자동 전환
     */
    @PatchMapping("/posts/{id}/pin")
    public ApiResponse<Void> pinToggle(@PathVariable Long id) {
        communityService.pinToggle(id);
        return ApiResponse.ok("핀고정 상태가 변경되었습니다.");
    }

    /**
     * DELETE /api/admin/community/posts/{id} — 강제 삭제 (Soft Delete)
     * 소유권 무관, 관리자 전용
     */
    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> forceDelete(@PathVariable Long id) {
        communityService.deletePost(null, id, "ADMIN");
        return ApiResponse.ok("게시글이 강제 삭제되었습니다.");
    }
}
