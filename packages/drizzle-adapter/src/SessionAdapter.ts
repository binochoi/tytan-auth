import { SessionAdapter as Adapter } from '@tytan-auth/common';
import { and, eq } from 'drizzle-orm';
import { PgColumn, PgDatabase, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { DefaultSessionTable } from './types/drizzle';



export class SessionAdapter<
    TSession extends TSessionTable['$inferSelect'],
    TSessionTable extends DefaultSessionTable,
> implements Adapter {
    public readonly types: {
        $Session: TSessionTable['$inferSelect']
    }
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly sessionTable: TSessionTable,
    ) {}
    async validate(token: string, refreshTo?: any): Promise<TSession> {
        if(refreshTo) {
            await this.db.update(this.sessionTable).set(refreshTo);
        }
        const session = await this.db
            .select()
            .from(this.sessionTable)
            .where(
                and(
                    eq(this.sessionTable.token, token)
                )
            ).then(([row]) => row ? row : null) as TSession;
        if(!session) {
            throw new Error('session is not exist');
        }
        const now = new Date();
        if(session.expiresAt < now) {
            throw new Error('session token expired');
        }
        return session as TSession;
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