/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('reservations', {
    id: 'id',
    first_name: { type: 'varchar', notNull: true },
    last_name: { type: 'varchar', notNull: true },
    deleted_at: { type: 'timestamp', notNull: true },
    price_listing_id: {
      type: 'integer',
      notNull: true,
      references: 'price_listings',
      onDelete: 'CASCADE'
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('reservations')
}
