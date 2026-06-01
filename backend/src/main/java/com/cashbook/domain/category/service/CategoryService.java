package com.cashbook.domain.category.service;

import com.cashbook.domain.category.dto.CategoryCreateRequest;
import com.cashbook.domain.category.dto.CategoryResponse;
import com.cashbook.domain.category.dto.CategoryUpdateRequest;
import com.cashbook.domain.category.entity.Category;
import com.cashbook.domain.category.mapper.CategoryMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    // ──────────────────────────────────────────────────────
    // 조회
    // ──────────────────────────────────────────────────────

    /** 기본 카테고리 + 내 커스텀 카테고리 목록 조회 */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId) {
        return categoryMapper.findByUserIdOrDefault(userId);
    }

    // ──────────────────────────────────────────────────────
    // 생성
    // ──────────────────────────────────────────────────────

    /** 커스텀 카테고리 생성 */
    @Transactional
    public CategoryResponse create(Long userId, CategoryCreateRequest req) {
        // 타입 검증
        if (!req.getType().equals("INCOME") && !req.getType().equals("EXPENSE")) {
            throw new BusinessException(ErrorCode.INVALID_TYPE);
        }

        // 동일 이름+타입 중복 체크
        if (categoryMapper.countByUserIdAndNameAndType(userId, req.getName(), req.getType()) > 0) {
            throw new BusinessException(ErrorCode.CATEGORY_NAME_DUPLICATE);
        }

        Category category = Category.builder()
                .userId(userId)
                .name(req.getName())
                .type(req.getType())
                .icon(req.getIcon())
                .color(req.getColor())
                .isDefault(false)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : (short) 0)
                .build();

        categoryMapper.insert(category);

        // 생성된 카테고리를 응답 형태로 반환 (insert로 id가 주입됨)
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(false)
                .sortOrder(category.getSortOrder())
                .build();
    }

    // ──────────────────────────────────────────────────────
    // 수정
    // ──────────────────────────────────────────────────────

    /** 커스텀 카테고리 수정 */
    @Transactional
    public CategoryResponse update(Long userId, Long id, CategoryUpdateRequest req) {
        Category existing = findAndValidateOwnership(userId, id);

        Category updated = Category.builder()
                .id(id)
                .userId(userId)
                .name(req.getName())
                .icon(req.getIcon())
                .color(req.getColor())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : existing.getSortOrder())
                .build();

        int rows = categoryMapper.update(updated);
        if (rows == 0) throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);

        return CategoryResponse.builder()
                .id(id)
                .name(req.getName())
                .type(existing.getType())   // type은 변경 불가
                .icon(req.getIcon())
                .color(req.getColor())
                .isDefault(false)
                .sortOrder(updated.getSortOrder())
                .build();
    }

    // ──────────────────────────────────────────────────────
    // 삭제
    // ──────────────────────────────────────────────────────

    /** 커스텀 카테고리 Soft Delete */
    @Transactional
    public void delete(Long userId, Long id) {
        findAndValidateOwnership(userId, id);

        int rows = categoryMapper.softDelete(id, userId);
        if (rows == 0) throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
    }

    // ──────────────────────────────────────────────────────
    // 내부 헬퍼
    // ──────────────────────────────────────────────────────

    /**
     * 카테고리 존재 확인 + 기본 카테고리 여부 + 소유권 검증
     */
    private Category findAndValidateOwnership(Long userId, Long id) {
        Category category = categoryMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        // 기본 카테고리 수정/삭제 불가
        if (Boolean.TRUE.equals(category.getIsDefault())) {
            throw new BusinessException(ErrorCode.DEFAULT_CATEGORY_FORBIDDEN);
        }

        // 타인 카테고리 수정/삭제 불가
        if (!userId.equals(category.getUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return category;
    }
}
