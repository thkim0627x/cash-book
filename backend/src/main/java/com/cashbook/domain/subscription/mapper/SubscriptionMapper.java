package com.cashbook.domain.subscription.mapper;

import com.cashbook.domain.subscription.dto.SubscriptionResponse;
import com.cashbook.domain.subscription.entity.Subscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubscriptionMapper {
    void insert(Subscription subscription);
    List<SubscriptionResponse> findByUserId(@Param("userId") Long userId);
    Optional<Subscription> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    int update(@Param("id") Long id, @Param("userId") Long userId,
               @Param("name") String name, @Param("startDate") java.time.LocalDate startDate,
               @Param("billingCycle") String billingCycle, @Param("amount") Long amount);
    int softDelete(@Param("id") Long id, @Param("userId") Long userId);
}
