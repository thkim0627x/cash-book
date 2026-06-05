package com.cashbook.domain.asset.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.asset.dto.AssetRequest;
import com.cashbook.domain.asset.dto.AssetResponse;
import com.cashbook.domain.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ApiResponse<List<AssetResponse>> getAll() {
        return ApiResponse.ok(assetService.getAll(currentUserId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssetResponse> create(@RequestBody @Valid AssetRequest req) {
        return ApiResponse.ok("자산이 등록되었습니다.", assetService.create(currentUserId(), req));
    }

    @PutMapping("/{id}")
    public ApiResponse<AssetResponse> update(@PathVariable Long id, @RequestBody @Valid AssetRequest req) {
        return ApiResponse.ok("자산이 수정되었습니다.", assetService.update(currentUserId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        assetService.delete(currentUserId(), id);
        return ApiResponse.ok("자산이 삭제되었습니다.");
    }

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
