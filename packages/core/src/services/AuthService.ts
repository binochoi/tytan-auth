import { DefaultSession, DefaultUser, AuthService as IAuthService, SessionAdapter, TokenManager, TytanAuthConfigOutput, UserAdapter } from '@tytan-auth/common';
import { nanoid } from 'nanoid'
export const getAuthService = ({
    user: userManager,
    session: sessionManager,
    token: tokenManager,
    config: { sessionIdSize: idSize },
}: {
    user: UserAdapter,
    session: SessionAdapter,
    token: TokenManager,
    config: TytanAuthConfigOutput,
}): IAuthService<DefaultUser, DefaultSession> => {
    const generateUid = () => nanoid(idSize);
    return {
        async signup(userInfo: DefaultUser) {
            const id = generateUid();
            const { mail } = userInfo;
            const user = await userManager.findOne({ mail }, []);
            if(user) {
                const tokens = await tokenManager.generate(user, { id, userId: user.id });
                const session = await sessionManager.insertOne({
                    id,
                    userId: user.id,
                    token: tokens.refreshToken,
                });
                return {
                    user,
                    session,
                    tokens,
                    status: 'existing' as const,
                }
            }
            const newUser = await userManager.insertOne(userInfo);
            const tokens = await tokenManager.generate(newUser, { id, userId: newUser.id });
            const session = await sessionManager.insertOne({
                id,
                userId: newUser.id,
                expiresAt: new Date(new Date().getTime() + tokens.refreshTokenExpires),
                token: tokens.refreshToken,
            });
            const status: 'existing' | 'beginner' = newUser.mail ? 'existing' : 'beginner';
            return {
                user: newUser,
                session,
                tokens,
                status,
            }
        },
        async signin(where: DefaultUser) {
            const id = generateUid();
            const user = await userManager.findOne(where, ['oauth']);
            if(!user) {
                throw new Error('user is not exist');
            }
            const tokens = await tokenManager.generate(user, { id, userId: user.id });
            const session = await sessionManager.insertOne({
                id,
                userId: user.id,
                expiresAt: new Date(new Date().getTime() + tokens.refreshTokenExpires),
                token: tokens.refreshToken,
            });
            const status: 'existing' | 'beginner' = user.mail ? 'existing' : 'beginner';
            return {
                user,
                session,
                tokens,
                status,
            }
        },
        async verifyOrRefresh(accessToken?: string, refreshToken?: string) {
            try {
                await tokenManager.validate(accessToken || '');
                return { status: 'healthy' as const }
            } catch(e) {}
            // refreshTokenRenewalPeriod 추가 예정 (rt 만료 다가올 시 rt까지 refresh 이후 session도 변경)
            try {
                const { userId: id } = await tokenManager.validate(refreshToken || '');
                const user = await userManager.findOne({ id }, []);
                const tokens = await tokenManager.generate(user);
                return {
                    status: 'refreshed' as const,
                    tokens,
                    user,
                }
            } catch(e) {
                return {
                    status: 'expired' as const,
                }
            }
        },
        async logout(refreshToken: string) {
            const { id } = await tokenManager.validate(refreshToken);
            return sessionManager.deleteOne({ id });
        }
    }
}