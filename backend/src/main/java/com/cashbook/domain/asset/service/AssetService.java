package com.cashbook.domain.asset.service;

import com.cashbook.domain.asset.dto.AssetRequest;
import com.cashbook.domain.asset.dto.AssetResponse;
import com.cashbook.domain.asset.entity.Asset;
import com.cashbook.domain.asset.mapper.AssetMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetMapper assetMapper;

    @Transactional(readOnly = true)
    public List<AssetResponse> getAll(Long userId) {
        return assetMapper.findByUserId(userId);
    }

    @Transactional
    public AssetResponse create(Long userId, AssetRequest req) {
        Asset asset = Asset.builder()
                .userId(userId)
                .name(req.getName())
                .initialAmount(req.getInitialAmount())
                .assetType(req.getAssetType())
                .build();
        assetMapper.insert(asset);
        return assetMapper.findByUserId(userId).stream()
                .filter(a -> a.getId().equals(asset.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
    }

    @Transactional
    public AssetResponse update(Long userId, Long id, AssetRequest req) {
        assetMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        assetMapper.update(id, userId, req.getName(), req.getInitialAmount(), req.getAssetType());
        return assetMapper.findByUserId(userId).stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        assetMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        assetMapper.softDelete(id, userId);
    }
}
