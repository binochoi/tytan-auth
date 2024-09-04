import { PgDatabase, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { UserAdapter as Adapter } from '@tytan-auth/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DrizzlePgTable } from './types/drizzle';
import { pickObjectProps } from './utils/pickObjectProps';
import { UnionToIntersection } from './utils/UnionToIntersection';
export class UserAdapter<
    TUserTable extends PgTableWithColumns<any>,
    TSubTable extends Record<string, DrizzlePgTable>
> implements Adapter {
    public readonly types: {
        $User: TUserTable['$inferSelect']
    }
    private readonly subTables: [keyof TSubTable, TSubTable[keyof TSubTable]][]
    constructor(
        private readonly db: PgDatabase<any ,any, any>,
        private readonly userTable: TUserTable,
        private readonly _subTables: TSubTable = {} as any,
    ) {
        this.subTables = Object.entries(_subTables) as any;
    }
    async getOneById(id: number, withTables: (keyof TSubTable)[]): Promise<
        (
            TUserTable['$inferSelect']
            & UnionToIntersection<
                (typeof withTables) extends [] ?
                    {} :
                    TSubTable[typeof withTables[number]]['$inferSelect']
            >
        ) | null
        > {
        const { userTable, subTables } = this;
        const selectedTables = subTables.filter(([key]) => withTables.includes(key));
        let query = this.db.select({
            ...getTableColumns(userTable),
            ...selectedTables.map(([_, table]) => table).map(getTableColumns)
        })
        .from(userTable)
        .limit(1)
        .where(eq(this.userTable.id, id))
        for(const [_, table] of selectedTables) {
            query = query.fullJoin(table, eq(userTable.id, table.id)) as any;
        }
        return query
            .then(([row]) => row ? row : null) as any;
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