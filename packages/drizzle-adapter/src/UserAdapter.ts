import { PgDatabase, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { UserAdapter as Adapter } from '@tytan-auth/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DrizzlePgTable } from './types/drizzle';
import { pickObjectProps } from './utils/pickObjectProps';
import { UnionToIntersection } from './utils/UnionToIntersection';
export class UserAdapter<
    TUserTable extends PgTableWithColumns<any>,
    TSubTable extends Record<string, DrizzlePgTable>,
    $SubUser = UnionToIntersection<TSubTable[keyof TSubTable]['$inferSelect']>,
    $User = TUserTable['$inferSelect'] & $SubUser
> implements Adapter {
    public readonly types: {
        $SubUser: $SubUser,
        $User: $User
    }
    private readonly subTables: [keyof TSubTable, TSubTable[keyof TSubTable]][]
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly userTable: TUserTable,
        private readonly _subTables: TSubTable = {} as any,
    ) {
        this.subTables = Object.entries(_subTables) as any;
    }
    async findOne<TWith extends (keyof TSubTable)[]>(whereQuery: Partial<$User>, withTables: TWith): Promise<
        (TUserTable['$inferSelect'] & UnionToIntersection<TSubTable[TWith[number]]['$inferSelect']>) | null
    > {
        const { userTable, subTables } = this;
        const selectedTables = subTables.filter(([key]) => withTables.includes(key));
        let query = this.db.select({
            ...getTableColumns(userTable),
            ...selectedTables.map(([_, table]) => table).map(getTableColumns)
        })
        .from(userTable)
        .limit(1)
        
        Object
            .entries(whereQuery)
            .forEach(([key, val]) => {
                query = query.where(eq(userTable[key], val)) as any;
            })
        for(const [_, table] of selectedTables) {
            query = query.fullJoin(table, eq(userTable.id, table.id)) as any;
        }
        const row = (await query) as any;
        return row ? row : null;
    }
    async insertOne(user: any) {
        const { userTable, subTables } = this;
        return this.db.transaction(async (tx) => {
            const [{ id }] = await tx.insert(userTable).values(pickObjectProps(userTable, user) as any).returning();
            await Promise.all(
                Object.entries(subTables)
                    .map<DrizzlePgTable>(([_, tables]) => tables as any)
                    .map(
                        (subtable) => tx.insert(subtable).values(pickObjectProps(subtable, {...user, id }))
                    )
            );
        })
    }
}