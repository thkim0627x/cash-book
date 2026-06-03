package com.cashbook.domain.notification.mapper;

import com.cashbook.domain.notification.dto.NotificationResponse;
import com.cashbook.domain.notification.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface NotificationMapper {

    /** 알림 생성 */
    void insert(Notification notification);

    /**
     * 최신순 최대 30건 조회 (읽음+미읽음 모두)
     */
    List<NotificationResponse> findByUserId(Long userId);

    Optional<Notification> findById(@Param("id") Long id, @Param("userId") Long userId);

    /** 단건 읽음 처리 */
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    /** 전체 읽음 처리 */
    void markAllAsRead(Long userId);

    /** 미읽음 개수 (배지용) */
    long countUnread(Long userId);
}
