package com.cashbook.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    // 편의 팩토리 메서드
    public static BusinessException notFound(ErrorCode errorCode) {
        return new BusinessException(errorCode);
    }

    public static BusinessException badRequest(ErrorCode errorCode) {
        return new BusinessException(errorCode);
    }

    public static BusinessException conflict(ErrorCode errorCode) {
        return new BusinessException(errorCode);
    }

    public static BusinessException forbidden() {
        return new BusinessException(ErrorCode.FORBIDDEN);
    }
}
