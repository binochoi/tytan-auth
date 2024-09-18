import { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

export type Column<T> = PgColumn<
{
    name: any;
    tableName: any;
    dataType: any;
    columnType: any;
    data: T;
    driverParam: any;
    notNull: true;
    hasDefault: any;
    enumValues: any;
    baseColumn: any;
}, object>;
export type DrizzlePgTable = PgTableWithColumns<{
	dialect: "pg";
	columns: any;
	schema: any;
	name: any;
}>
export type DefaultUserTable = PgTableWithColumns<{
	dialect: "pg";
	columns: {
        id: Column<number>,
		mail: Column<string>,
        phoneNumber: Column<string>,
        name: Column<string>
	};
	schema: any;
	name: any;
}>;

export type DefaultSessionTable = PgTableWithColumns<{
	dialect: "pg";
	columns: {
        id: Column<string>,
		userId: Column<number>,
		expiresAt: Column<Date>,
		token: Column<string>
	};
	schema: any;
	name: any;
}>;
