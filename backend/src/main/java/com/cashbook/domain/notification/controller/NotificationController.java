package com.cashbook.domain.notification.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.notification.dto.NotificationResponse;
import com.cashbook.domain.notification.dto.UnreadCountResponse;
import com.cashbook.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications — 알림 목록 (최신순 30건)
     * 읽음 + 미읽음 모두 반환
     */
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.ok(notificationService.getNotifications(userId));
    }

    /**
     * GET /api/notifications/unread-count — 미읽음 개수 (헤더 배지용)
     */
    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.ok(notificationService.getUnreadCount(userId));
    }

    /**
     * PATCH /api/notifications/{id}/read — 단건 읽음 처리
     * NOTE: 리터럴 경로 /unread-count 가 /{id}/read 보다 우선 매핑됨 — 충돌 없음
     */
    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        notificationService.markAsRead(userId, id);
        return ApiResponse.ok("알림을 읽음 처리했습니다.");
    }

    /**
     * PATCH /api/notifications/read-all — 전체 읽음 처리
     */
    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(
            @AuthenticationPrincipal Long userId
    ) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.ok("모든 알림을 읽음 처리했습니다.");
    }
}
