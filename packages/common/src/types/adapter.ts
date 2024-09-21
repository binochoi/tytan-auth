export interface UserAdapter<TUser extends object = any> {
    types: Record<string, any>
    findOne: (
        whereQuery: TUser,
        withTables: any[],
    ) => Promise<TUser | null>
    insertOne: (user: any) => Promise<any>
    // validateLocal(form: { id: string, password: string }): Promise<User>;
}

export interface SessionAdapter<TSession extends object = any, TSessionId extends string | number = string> {
    types: Record<string, any>
    /**
     * @param refreshTo
     * refreshToken의 기간을 업데이트하고 토큰을 바꿔치기 할지
     */
    validate: (refreshToken: string, refreshTo?: TSession) => Promise<TSession | null>;
    insertOne: (info: TSession) => Promise<TSession>;
    deleteOne: (where: Partial<TSession>) => Promise<TSession>;
}
export type SessionTokens = {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    refreshTokenExpires: number;
};