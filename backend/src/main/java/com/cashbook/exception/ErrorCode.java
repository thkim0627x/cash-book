package com.cashbook.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 400
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    INVALID_TYPE(HttpStatus.BAD_REQUEST, "유효하지 않은 타입입니다. (INCOME | EXPENSE)"),
    INVALID_YEAR_MONTH(HttpStatus.BAD_REQUEST, "년월 형식이 올바르지 않습니다. (YYYY-MM)"),

    // 401
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않거나 만료된 Refresh Token입니다. 다시 로그인해 주세요."),

    // 403
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    DEFAULT_CATEGORY_FORBIDDEN(HttpStatus.FORBIDDEN, "기본 카테고리는 수정/삭제할 수 없습니다."),

    // 404
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "거래내역을 찾을 수 없습니다."),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."),
    BUDGET_NOT_FOUND(HttpStatus.NOT_FOUND, "예산을 찾을 수 없습니다."),
    ASSET_NOT_FOUND(HttpStatus.NOT_FOUND, "자산을 찾을 수 없습니다."),
    SUBSCRIPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다."),
    BENEFIT_NOT_FOUND(HttpStatus.NOT_FOUND, "혜택 정보를 찾을 수 없습니다."),
    USER_CONDITION_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자 조건 정보가 없습니다. 조건을 먼저 등록해 주세요."),

    // 409
    EMAIL_DUPLICATE(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    BUDGET_DUPLICATE(HttpStatus.CONFLICT, "해당 월에 동일한 카테고리의 예산이 이미 존재합니다."),
    CATEGORY_NAME_DUPLICATE(HttpStatus.CONFLICT, "같은 이름의 카테고리가 이미 존재합니다."),

    // 500
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
