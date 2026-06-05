package com.cashbook.domain.subscription.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.subscription.dto.SubscriptionRequest;
import com.cashbook.domain.subscription.dto.SubscriptionResponse;
import com.cashbook.domain.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ApiResponse<List<SubscriptionResponse>> getAll() {
        return ApiResponse.ok(subscriptionService.getAll(currentUserId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SubscriptionResponse> create(@RequestBody @Valid SubscriptionRequest req) {
        return ApiResponse.ok("구독이 등록되었습니다.", subscriptionService.create(currentUserId(), req));
    }

    @PutMapping("/{id}")
    public ApiResponse<SubscriptionResponse> update(@PathVariable Long id, @RequestBody @Valid SubscriptionRequest req) {
        return ApiResponse.ok("구독이 수정되었습니다.", subscriptionService.update(currentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        subscriptionService.delete(currentUserId(), id);
        return ApiResponse.ok("구독이 삭제되었습니다.");
    }

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
