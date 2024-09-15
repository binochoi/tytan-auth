import { PgDatabase, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { UserAdapter as Adapter } from '@tytan-auth/common';
import { DrizzlePgTable } from './types/drizzle';
import { UnionToIntersection } from './utils/UnionToIntersection';
import { Repository } from 'drizzle-repository-generator';
export class UserAdapter<
    TUserTable extends PgTableWithColumns<any>,
    TSubTable extends Record<string, DrizzlePgTable>,
    $SubUser = UnionToIntersection<TSubTable[keyof TSubTable]['$inferSelect']>,
    $User = TUserTable['$inferSelect'] & $SubUser,
> implements Adapter {
    private readonly repo;
    public readonly types: {
        $SubUser: $SubUser,
        $User: $User
    }
    private readonly subTables: [keyof TSubTable, TSubTable[keyof TSubTable]][]
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly userTable: TUserTable,
        private readonly _subTables: TSubTable,
    ) {
        this.subTables = Object.entries(_subTables) as any;
        this.repo = Repository(db, userTable, _subTables);
    }
    async findOne<TWith extends keyof TSubTable>(
        whereQuery: Partial<$User>,
        withTables: TWith[]
    ) {
        return this.repo.with(...withTables).find(whereQuery as any).returnFirst();
    }
    async insertOne(user: (TUserTable['$inferInsert'] & UnionToIntersection<TSubTable[keyof TSubTable]['$inferInsert']>)) {
        return this.repo.insert(user as any);
    }
}