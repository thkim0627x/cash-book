package com.cashbook.domain.category.mapper;

import com.cashbook.domain.category.dto.CategoryResponse;
import com.cashbook.domain.category.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryMapper {

    /**
     * 기본 카테고리(user_id IS NULL) + 내 카테고리(user_id = userId) 조회
     * Soft Delete 제외, sort_order ASC 정렬
     */
    List<CategoryResponse> findByUserIdOrDefault(Long userId);

    /**
     * ID로 단건 조회 — 소유권/기본카테고리 여부 확인용
     * Soft Delete 제외
     */
    Optional<Category> findById(Long id);

    /**
     * 같은 유저의 동일 이름 + 타입 중복 체크 (커스텀 카테고리)
     * @return 존재하면 1 이상
     */
    int countByUserIdAndNameAndType(@Param("userId") Long userId,
                                   @Param("name")   String name,
                                   @Param("type")   String type);

    /** 커스텀 카테고리 생성 */
    void insert(Category category);

    /** 커스텀 카테고리 수정 (이름/아이콘/색상/순서) */
    int update(Category category);

    /** 커스텀 카테고리 Soft Delete (본인 소유 검증 포함) */
    int softDelete(@Param("id") Long id, @Param("userId") Long userId);
}
