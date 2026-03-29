import type { Migration } from '../migration';

const createShotsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('shots')
      .ifNotExists()
      .addColumn('id', 'integer', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('shots_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('weapon_name', 'varchar', (col) => col.notNull())
      .addColumn('weapon_id', 'varchar', (col) => col.notNull())
      .addColumn('projectile_id', 'varchar', (col) => col.notNull())
      .addColumn('player_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('player_side', 'integer', (col) => col.notNull())
      .addColumn('player_name', 'varchar', (col) => col.notNull())
      .addColumn('player_team_name', 'varchar', (col) => col.notNull())
      .addColumn('is_player_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('x', 'real', (col) => col.notNull())
      .addColumn('y', 'real', (col) => col.notNull())
      .addColumn('z', 'real', (col) => col.notNull())
      .addColumn('player_velocity_x', 'real', (col) => col.notNull())
      .addColumn('player_velocity_y', 'real', (col) => col.notNull())
      .addColumn('player_velocity_z', 'real', (col) => col.notNull())
      .addColumn('player_yaw', 'real', (col) => col.notNull())
      .addColumn('player_pitch', 'real', (col) => col.notNull())
      .addColumn('recoil_index', 'real', (col) => col.notNull())
      .addColumn('aim_punch_angle_x', 'real', (col) => col.notNull())
      .addColumn('aim_punch_angle_y', 'real', (col) => col.notNull())
      .addColumn('view_punch_angle_x', 'real', (col) => col.notNull())
      .addColumn('view_punch_angle_y', 'real', (col) => col.notNull())
      .execute();

    await transaction.schema
      .createIndex('shots_match_checksum_idx')
      .ifNotExists()
      .on('shots')
      .column('match_checksum')
      .execute();
    await transaction.schema
      .createIndex('shots_match_checksum_round_number_idx')
      .ifNotExists()
      .on('shots')
      .columns(['match_checksum', 'round_number'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createShotsTable;
