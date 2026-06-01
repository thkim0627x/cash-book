package com.cashbook.domain.category.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.category.dto.CategoryCreateRequest;
import com.cashbook.domain.category.dto.CategoryResponse;
import com.cashbook.domain.category.dto.CategoryUpdateRequest;
import com.cashbook.domain.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** GET /api/categories — 카테고리 목록 (기본 + 내 카테고리) */
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories() {
        return ApiResponse.ok(categoryService.getCategories(currentUserId()));
    }

    /** POST /api/categories — 커스텀 카테고리 생성 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> create(@RequestBody @Valid CategoryCreateRequest req) {
        return ApiResponse.ok("카테고리가 생성되었습니다.", categoryService.create(currentUserId(), req));
    }

    /** PUT /api/categories/{id} — 커스텀 카테고리 수정 */
    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid CategoryUpdateRequest req
    ) {
        return ApiResponse.ok("카테고리가 수정되었습니다.", categoryService.update(currentUserId(), id, req));
    }

    /** DELETE /api/categories/{id} — 커스텀 카테고리 삭제 (기본 카테고리 불가) */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(currentUserId(), id);
        return ApiResponse.ok("카테고리가 삭제되었습니다.");
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
