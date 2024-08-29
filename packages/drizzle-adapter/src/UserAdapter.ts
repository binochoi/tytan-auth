import { PgDatabase, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { UserAdapter as Adapter } from '@tytan-auth/common';
import { eq } from 'drizzle-orm';

export class UserAdapter<
    TUser extends TUserTable['$inferSelect'],
    TUserTable extends PgTableWithColumns<any> = any,
> implements Adapter {
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly userTable: TUserTable
    ) {}
    async getOneById(id: number): Promise<TUser | null> {
        const [user] = await this.db.select().from(this.userTable).limit(1).where(eq(this.userTable.id, id));
        return user as TUser | null;
    }
    async insertOne(user: TUserTable['$inferInsert']) {
        return this.db.insert(this.userTable).values(user as any);
    }
    // validateLocal(form: { id: string; password: string; }) {
    //     throw new Error('Method not implemented.');
    // }
}