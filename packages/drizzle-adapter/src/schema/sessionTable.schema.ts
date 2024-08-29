import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessionTable = pgTable('sessions', {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: varchar('name', {
      length: 15,
    }).notNull().unique(),
    expiresAt: timestamp('expires_at'),
    ip: varchar('ip')
});