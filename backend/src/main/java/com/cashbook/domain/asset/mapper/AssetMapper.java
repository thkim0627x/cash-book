package com.cashbook.domain.asset.mapper;

import com.cashbook.domain.asset.dto.AssetResponse;
import com.cashbook.domain.asset.entity.Asset;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface AssetMapper {
    void insert(Asset asset);
    List<AssetResponse> findByUserId(@Param("userId") Long userId);
    Optional<Asset> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    int update(@Param("id") Long id, @Param("userId") Long userId, @Param("name") String name,
               @Param("initialAmount") Long initialAmount, @Param("assetType") String assetType);
    int softDelete(@Param("id") Long id, @Param("userId") Long userId);
}
