package com.cashbook.domain.notification.service;

import com.cashbook.domain.notification.dto.NotificationResponse;
import com.cashbook.domain.notification.dto.UnreadCountResponse;
import com.cashbook.domain.notification.entity.Notification;
import com.cashbook.domain.notification.mapper.NotificationMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    /**
     * 알림 생성 — 재사용 가능한 공용 메서드.
     * 커뮤니티 댓글, 예산 알림, 혜택 마감 등에서 호출.
     *
     * @param userId  수신 유저 ID
     * @param type    BUDGET_ALERT | BENEFIT_DEADLINE | COMMUNITY_COMMENT
     * @param title   알림 제목
     * @param message 알림 메시지 (nullable)
     * @param link    클릭 시 이동 경로 (nullable, 예: /community/123)
     */
    @Transactional
    public void create(Long userId, String type, String title, String message, String link) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .link(link)
                .build();
        notificationMapper.insert(notification);
        log.debug("알림 생성 — userId={}, type={}", userId, type);
    }

    /** 알림 목록 조회 (최신순 30건) */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationMapper.findByUserId(userId);
    }

    /** 단건 읽음 처리 */
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        int updated = notificationMapper.markAsRead(notificationId, userId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
    }

    /** 전체 읽음 처리 */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationMapper.markAllAsRead(userId);
    }

    /** 미읽음 개수 조회 */
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long userId) {
        return UnreadCountResponse.builder()
                .count(notificationMapper.countUnread(userId))
                .build();
    }
}
