import { Strategy, SessionTokens } from "@tytan-auth/common";

export interface DefaultEndpoints {
    'refreshAccessToken': (strategy: string,refreshToken: string) => Promise<SessionTokens>,
};
const strategy: Strategy<any, DefaultEndpoints> = (options) => ({
    token,
    adapters: {
        user: userAdapter,
        session: sessionAdapter,
    }
}) => {
    return {
        name: 'common' as const,
        endpoints: {
            'refreshAccessToken': async (strategy, refreshToken) => {
                throw new Error();
            }
        },
        types: {} as {}
    }
}
export default strategy;