/**
 * 토큰 자동 refresh 로직.
 * - 로그인 하면 쿠키에 넣을 토큰을 발급함 (RT, AT)
 *   persisted를 X-User라는 헤더로 받아 session storage에 저장함
 * - 이후 사이트를 왔다갔다 할 경우 쿠키가 있으면 validation을 하는데,
 * - validation failed 뜰 경우 RT, AT 모두 변경함.
 */
export class TokenManager<TokenInfo extends object> {
    issue(data: TokenInfo) {
        
        return {
            token: '',
            expires: new Date(),
        }
    }
    validate(token: string) {
        
    }
}