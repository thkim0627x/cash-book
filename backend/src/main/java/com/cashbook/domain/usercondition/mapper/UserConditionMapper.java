package com.cashbook.domain.usercondition.mapper;

import com.cashbook.domain.usercondition.entity.UserCondition;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserConditionMapper {

    /** userId로 조건 조회 */
    Optional<UserCondition> findByUserId(Long userId);

    /**
     * 조건 저장 (upsert).
     * user_id UNIQUE — 이미 존재하면 UPDATE, 없으면 INSERT.
     * PostgreSQL ON CONFLICT DO UPDATE 활용.
     */
    void upsert(UserCondition userCondition);
}
