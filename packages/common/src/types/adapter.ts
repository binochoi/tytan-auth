export interface UserAdapter<TUser extends object = any> {
    types: Record<string, any>
    getOneById: (id: number, withTables: any[]) => Promise<TUser | null>
    insertOne: (user: any) => Promise<void>
    // validateLocal(form: { id: string, password: string }): Promise<User>;
}

export interface SessionAdapter<TSession extends object = any, TSessionId extends string | number = string> {
    types: Record<string, any>
    /**
     * @param refreshTo
     * refreshToken의 기간을 업데이트하고 토큰을 바꿔치기 할지
     */
    validate: (refreshToken: string, refreshTo?: TSession extends Record<'id' | 'expiresAt', any> ? Pick<TSession, 'id' | 'expiresAt'> : unknown) => Promise<TSession>;
    insertOne: (info: TSession) => Promise<TSessionId>;
}
export type SessionTokens = {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
};