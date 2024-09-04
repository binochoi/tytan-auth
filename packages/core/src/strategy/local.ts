import { Strategy, SessionTokens } from "@tytan-auth/common";

export interface LocalEndpoints {
    'signin': (form: Record<'id' | 'password', string>) => Promise<SessionTokens>,
    'signup': () => Promise<SessionTokens>,
};
const strategy: Strategy<any, LocalEndpoints> = (options) => ({
    adapters: {
        user: userAdapter,
        session: sessionAdapter,
    }
}) => {
    return {
        name: 'local' as const,
        endpoints: {
            'signin': async (form) => {
                // const user = await userAdapter.validateLocal(form);
                // const { id, ...accessToken } = user;
                return sessionAdapter.insertOne as any;
            },
            'signup': async () => {
                throw new Error();
            }
        },
        types: {} as {}
    }
}
export default strategy;