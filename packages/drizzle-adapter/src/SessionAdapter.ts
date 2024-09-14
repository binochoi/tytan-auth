import { SessionAdapter as Adapter } from '@tytan-auth/common';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { DefaultSessionTable } from './types/drizzle';
import { Repository } from 'drizzle-repository-generator';



export class SessionAdapter<
    TSession extends TSessionTable['$inferSelect'],
    TSessionTable extends DefaultSessionTable,
> implements Adapter {
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
    async validate(token: string, refreshTo?: any): Promise<TSession> {
        if(refreshTo) {
            await this.db.update(this.sessionTable).set(refreshTo);
        }
        const session = await this.repo.with().find({ id: token } as any).returnFirst() as TSession;
        if(!session) {
            throw new Error('session is not exist');
        }
        const now = new Date();
        if(session.expiresAt < now) {
            throw new Error('session token expired');
        }
        return session;
    }
    async insertOne(info: TSession) {
        const [row] = await this.db
            .insert(this.sessionTable)
            .values(info)
            .returning();
        return row.id;
    }
    // generate: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
    // generateTokens: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
    // refreshAccessToken: (param: { refreshToken: any; accessToken: any; }) => Promise<SessionTokens>;
}