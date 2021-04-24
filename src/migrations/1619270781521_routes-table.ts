/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('routes', {
    id: 'id',
    ref: { type: 'varchar', notNull: true },
    leg_ref: { type: 'varchar', notNull: true },
    distance: { type: 'bigint', notNull: true },
    imports_id: {
      type: 'integer',
      notNull: true,
      references: 'imports',
      onDelete: 'CASCADE'
    },
    origin_id: {
      type: 'integer',
      notNull: true,
      references: 'planets',
      onDelete: 'CASCADE'
    },
    dest_id: {
      type: 'integer',
      notNull: true,
      references: 'planets',
      onDelete: 'CASCADE'
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('routes');
}
