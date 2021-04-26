/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('price_listings', {
    id: 'id',
    origin: { type: 'varchar', notNull: true },
    dest: { type: 'varchar', notNull: true },
    price: { type: 'decimal', notNull: true },
    distance: { type: 'varchar', notNull: true },
    start_time: { type: 'timestamp', notNull: true },
    end_time: { type: 'timestamp', notNull: true },
  })

  pgm.createTable('providers_in_price_listings', {
    id: 'id',
    providers_id: {
      type: 'integer',
      notNull: true,
      references: 'providers',
      onDelete: 'CASCADE'
    },
    price_listings_id: {
      type: 'integer',
      notNull: true,
      references: 'price_listings',
      onDelete: 'CASCADE'
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('providers_in_price_listings');
  pgm.dropTable('price_listings');
}
