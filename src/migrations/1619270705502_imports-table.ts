/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('imports', {
    id: 'id',
    ref: { type: 'varchar', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    deleted_at: { type: 'timestamp', notNull: true },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('imports')
}
