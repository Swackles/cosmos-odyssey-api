/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('providers', {
    id: 'id',
    ref: { type: 'varchar', notNull: true },
    price: { type: 'integer', notNull: true },
    start_time: { type: 'timestamp', notNull: true },
    end_time: { type: 'timestamp', notNull: true },
    routes_id: {
      type: 'integer',
      notNull: true,
      references: 'routes',
      onDelete: 'CASCADE'
    },
    company_id: {
      type: 'integer',
      notNull: true,
      references: 'companies',
      onDelete: 'CASCADE'
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('providers');
}
