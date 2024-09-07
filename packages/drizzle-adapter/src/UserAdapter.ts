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
    async findOne<TWith extends (keyof TSubTable)[], TReturn extends (TUserTable['$inferSelect'] & UnionToIntersection<TSubTable[TWith[number]]['$inferSelect']>) | null>(whereQuery: Partial<$User>, withTables: TWith): Promise<TReturn> {
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
                const tables = [userTable, ...subTables.map(([_, table]) => table)];
                const table = tables.filter((table) => key in table['_']['columns'])[0];
                if(!table) {
                    return;
                }
                query = query.where(eq(table['_']['columns'][key], val)) as any;
            })
        for(const [_, table] of selectedTables) {
            query = query.leftJoin(table, eq(userTable.id, table.id)) as any;
        }
        const [row] = (await query);
        return row as TReturn;
    }
    async insertOne(user: (TUserTable['$inferInsert'] & UnionToIntersection<TSubTable[keyof TSubTable]['$inferInsert']>)) {
        const { userTable, subTables } = this;
        return this.db.transaction(async (tx) => {
            const [{ id }] = await tx.insert(userTable).values(pickObjectProps(userTable, user) as any).returning();
            await Promise.all(
                Object.entries(subTables)
                    .map<DrizzlePgTable>(([_, tables]) => tables as any)
                    .map(
                        (subtable) => {
                            const payload = pickObjectProps(subtable, user);
                            const isNotInsertionOfThisTable = Object.keys(payload).length === 0;
                            if(isNotInsertionOfThisTable) {
                                return;
                            }
                            return tx.insert(subtable).values(pickObjectProps(subtable, {...payload, id }))
                        }
                    )
            );
        })
    }
}