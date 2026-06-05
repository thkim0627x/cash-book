package com.cashbook.domain.subscription.service;

import com.cashbook.domain.subscription.dto.SubscriptionRequest;
import com.cashbook.domain.subscription.dto.SubscriptionResponse;
import com.cashbook.domain.subscription.entity.Subscription;
import com.cashbook.domain.subscription.mapper.SubscriptionMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionMapper subscriptionMapper;

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll(Long userId) {
        return subscriptionMapper.findByUserId(userId);
    }

    @Transactional
    public SubscriptionResponse create(Long userId, SubscriptionRequest req) {
        Subscription sub = Subscription.builder()
                .userId(userId)
                .name(req.getName())
                .startDate(req.getStartDate())
                .billingCycle(req.getBillingCycle())
                .amount(req.getAmount())
                .build();
        subscriptionMapper.insert(sub);
        return subscriptionMapper.findByUserId(userId).stream()
                .filter(s -> s.getId().equals(sub.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
    }

    @Transactional
    public SubscriptionResponse update(Long userId, Long id, SubscriptionRequest req) {
        subscriptionMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        subscriptionMapper.update(id, userId, req.getName(), req.getStartDate(),
                req.getBillingCycle(), req.getAmount());
        return subscriptionMapper.findByUserId(userId).stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        subscriptionMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        subscriptionMapper.softDelete(id, userId);
    }
}
