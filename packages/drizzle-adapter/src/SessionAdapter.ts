import { SessionAdapter as Adapter, SessionTokens } from '@tytan-auth/common';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { DefaultSessionTable } from './types/drizzle';
import { Repository } from 'drizzle-repository-generator';



export class SessionAdapter<
    TSession extends TSessionTable['$inferSelect'],
    TSessionTable extends DefaultSessionTable,
> implements Adapter<TSession> {
    public readonly types: {
        $Session: TSessionTable['$inferSelect']
    }
    private readonly repo;
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly sessionTable: TSessionTable,
    ) {
        this.repo = Repository(db, sessionTable);
    }
    /** validate and refresh if wanted */
    async validate(id: string, refreshTo?: Pick<TSession, 'id' | 'expiresAt'>): Promise<TSession | null> {
        const now = new Date();
        if(refreshTo) {
            const session = await this.repo.update(refreshTo as any)
                .where({ id } as any) as TSession
            return {
                ...session,
                isExpired: session.expiresAt < now,
            }
        }
        const session = await this.repo.with().find({ id } as any).returnFirst() as TSession;
        if(!session) {
            return null;
        }
        return {
            ...session,
            isExpired: session.expiresAt < now
        };
    }
    async insertOne(info: TSession) {
        const [row] = await this.db
            .insert(this.sessionTable)
            .values(info)
            .returning();
        return row as TSession;
    }
    async deleteOne(where: Partial<TSession>) {
        return this.repo.delete(where) as Promise<TSession>;
    }
    // generate: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
    // generateTokens: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
    // refreshAccessToken: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
}