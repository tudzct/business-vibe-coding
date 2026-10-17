import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792195200000 implements MigrationInterface {
  name = 'InitialSchema1792195200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`principals\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`user_id\` VARCHAR(191) NOT NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_principals_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`virtual_backgrounds\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`asset_reference\` VARCHAR(2048) NOT NULL,
        \`active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`sessions\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`kind\` ENUM('LIVE_STREAM', 'VIDEO_CONFERENCE') NOT NULL,
        \`status\` ENUM('LOBBY', 'LIVE', 'ENDED') NOT NULL DEFAULT 'LOBBY',
        \`designated_host_principal_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`host_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
        \`spotlighted_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
        \`version\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`ended_at\` DATETIME(3) NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`idx_sessions_designated_host\` (\`designated_host_principal_id\`),
        KEY \`idx_sessions_host_participant\` (\`host_participant_id\`),
        KEY \`idx_sessions_spotlighted_participant\` (\`spotlighted_participant_id\`),
        CONSTRAINT \`fk_sessions_designated_host\` FOREIGN KEY (\`designated_host_principal_id\`) REFERENCES \`principals\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`participants\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`principal_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`user_id\` VARCHAR(191) NOT NULL,
        \`display_name\` VARCHAR(50) NOT NULL,
        \`role\` ENUM('HOST', 'BROADCASTER', 'VIEWER', 'STAGE_PARTICIPANT') NOT NULL,
        \`status\` ENUM('JOINED', 'LEFT') NOT NULL DEFAULT 'JOINED',
        \`joined_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`left_at\` DATETIME(3) NULL,
        \`microphone_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
        \`camera_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
        \`version\` INT UNSIGNED NOT NULL DEFAULT 1,
        \`active_principal_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS (CASE WHEN \`status\` = 'JOINED' THEN \`principal_id\` ELSE NULL END) VIRTUAL,
        \`active_host_session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS (CASE WHEN \`status\` = 'JOINED' AND \`role\` = 'HOST' THEN \`session_id\` ELSE NULL END) VIRTUAL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_participants_session_joined\` (\`session_id\`, \`joined_at\`, \`id\`),
        UNIQUE KEY \`uq_participants_active_principal\` (\`session_id\`, \`active_principal_id\`),
        UNIQUE KEY \`uq_participants_active_host\` (\`active_host_session_id\`),
        CONSTRAINT \`fk_participants_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_participants_principal\` FOREIGN KEY (\`principal_id\`) REFERENCES \`principals\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      ALTER TABLE \`sessions\`
        ADD CONSTRAINT \`fk_sessions_host_participant\` FOREIGN KEY (\`host_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        ADD CONSTRAINT \`fk_sessions_spotlighted_participant\` FOREIGN KEY (\`spotlighted_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE \`media_preferences\` (
        \`participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`microphone_device_id\` VARCHAR(255) NULL,
        \`camera_device_id\` VARCHAR(255) NULL,
        \`speaker_device_id\` VARCHAR(255) NULL,
        \`virtual_background_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`participant_id\`),
        KEY \`idx_media_preferences_background\` (\`virtual_background_id\`),
        CONSTRAINT \`fk_media_preferences_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_media_preferences_background\` FOREIGN KEY (\`virtual_background_id\`) REFERENCES \`virtual_backgrounds\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`view_preferences\` (
        \`participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`layout\` ENUM('EQUAL_PROMINENCE', 'SIDEBAR', 'PRESENTER') NOT NULL DEFAULT 'EQUAL_PROMINENCE',
        \`focused_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
        \`side_panel\` VARCHAR(64) NULL,
        \`picture_in_picture\` TINYINT(1) NOT NULL DEFAULT 0,
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`participant_id\`),
        KEY \`idx_view_preferences_focus\` (\`focused_participant_id\`),
        CONSTRAINT \`fk_view_preferences_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_view_preferences_focus\` FOREIGN KEY (\`focused_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`live_streams\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`status\` ENUM('READY', 'STARTING', 'LIVE', 'ENDED') NOT NULL DEFAULT 'READY',
        \`version\` INT UNSIGNED NOT NULL DEFAULT 0,
        \`started_at\` DATETIME(3) NULL,
        \`ended_at\` DATETIME(3) NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_live_streams_session\` (\`session_id\`),
        CONSTRAINT \`fk_live_streams_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`stage_requests\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`status\` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        \`decided_by_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`decided_at\` DATETIME(3) NULL,
        \`version\` INT UNSIGNED NOT NULL DEFAULT 1,
        \`pending_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS (CASE WHEN \`status\` = 'PENDING' THEN \`participant_id\` ELSE NULL END) VIRTUAL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_stage_requests_session_created\` (\`session_id\`, \`created_at\`, \`id\`),
        UNIQUE KEY \`uq_stage_requests_pending_participant\` (\`session_id\`, \`pending_participant_id\`),
        KEY \`idx_stage_requests_participant\` (\`participant_id\`),
        KEY \`idx_stage_requests_decider\` (\`decided_by_participant_id\`),
        CONSTRAINT \`fk_stage_requests_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_stage_requests_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_stage_requests_decider\` FOREIGN KEY (\`decided_by_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`chat_messages\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`sender_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`body\` VARCHAR(1000) NOT NULL,
        \`sent_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`sequence\` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_chat_messages_session_sequence\` (\`session_id\`, \`sequence\`),
        KEY \`idx_chat_messages_sender\` (\`sender_participant_id\`),
        CONSTRAINT \`fk_chat_messages_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_chat_messages_sender\` FOREIGN KEY (\`sender_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`reaction_events\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`reaction\` ENUM('LIKE', 'CLAP', 'HEART', 'CELEBRATE', 'HAND', 'SURPRISE') NOT NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`sequence\` BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_reactions_session_sequence\` (\`session_id\`, \`sequence\`),
        KEY \`idx_reactions_participant\` (\`participant_id\`),
        CONSTRAINT \`fk_reactions_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_reactions_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`content_shares\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`owner_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`kind\` ENUM('SCREEN', 'PDF') NOT NULL,
        \`status\` ENUM('ACTIVE', 'STOPPED') NOT NULL,
        \`source_reference\` VARCHAR(2048) NOT NULL,
        \`version\` INT UNSIGNED NOT NULL DEFAULT 1,
        \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`stopped_at\` DATETIME(3) NULL,
        \`active_session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS (CASE WHEN \`status\` = 'ACTIVE' THEN \`session_id\` ELSE NULL END) VIRTUAL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_content_shares_active_session\` (\`active_session_id\`),
        KEY \`idx_content_shares_session_started\` (\`session_id\`, \`started_at\`, \`id\`),
        KEY \`idx_content_shares_owner\` (\`owner_participant_id\`),
        CONSTRAINT \`fk_content_shares_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_content_shares_owner\` FOREIGN KEY (\`owner_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`recordings\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`started_by_participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`status\` ENUM('IDLE', 'STARTING', 'RECORDING', 'STOPPED', 'FAILED') NOT NULL,
        \`version\` INT UNSIGNED NOT NULL DEFAULT 1,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`started_at\` DATETIME(3) NULL,
        \`stopped_at\` DATETIME(3) NULL,
        \`active_session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin GENERATED ALWAYS AS (CASE WHEN \`status\` IN ('STARTING', 'RECORDING') THEN \`session_id\` ELSE NULL END) VIRTUAL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_recordings_active_session\` (\`active_session_id\`),
        KEY \`idx_recordings_session_created\` (\`session_id\`, \`created_at\`, \`id\`),
        KEY \`idx_recordings_started_by\` (\`started_by_participant_id\`),
        CONSTRAINT \`fk_recordings_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_recordings_started_by\` FOREIGN KEY (\`started_by_participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`departures\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`participant_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`kind\` ENUM('LEAVE', 'END') NOT NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`idx_departures_session_created\` (\`session_id\`, \`created_at\`, \`id\`),
        KEY \`idx_departures_participant\` (\`participant_id\`),
        CONSTRAINT \`fk_departures_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_departures_participant\` FOREIGN KEY (\`participant_id\`) REFERENCES \`participants\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`idempotency_responses\` (
        \`id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`status_code\` SMALLINT UNSIGNED NOT NULL,
        \`response_body\` JSON NOT NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`idempotency_records\` (
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`principal_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`session_id\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`operation\` VARCHAR(100) NOT NULL,
        \`idempotency_key\` VARCHAR(191) NOT NULL,
        \`payload_hash\` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`response_reference\` CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        \`completed_at\` DATETIME(3) NOT NULL,
        \`expires_at\` DATETIME(3) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_idempotency_command\` (\`principal_id\`, \`session_id\`, \`operation\`, \`idempotency_key\`),
        KEY \`idx_idempotency_expires_at\` (\`expires_at\`),
        KEY \`idx_idempotency_session\` (\`session_id\`),
        KEY \`idx_idempotency_response\` (\`response_reference\`),
        CONSTRAINT \`fk_idempotency_principal\` FOREIGN KEY (\`principal_id\`) REFERENCES \`principals\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fk_idempotency_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_idempotency_response\` FOREIGN KEY (\`response_reference\`) REFERENCES \`idempotency_responses\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sessions` DROP FOREIGN KEY `fk_sessions_spotlighted_participant`');
    await queryRunner.query('ALTER TABLE `sessions` DROP FOREIGN KEY `fk_sessions_host_participant`');
    await queryRunner.query('DROP TABLE `idempotency_records`');
    await queryRunner.query('DROP TABLE `idempotency_responses`');
    await queryRunner.query('DROP TABLE `departures`');
    await queryRunner.query('DROP TABLE `recordings`');
    await queryRunner.query('DROP TABLE `content_shares`');
    await queryRunner.query('DROP TABLE `reaction_events`');
    await queryRunner.query('DROP TABLE `chat_messages`');
    await queryRunner.query('DROP TABLE `stage_requests`');
    await queryRunner.query('DROP TABLE `live_streams`');
    await queryRunner.query('DROP TABLE `view_preferences`');
    await queryRunner.query('DROP TABLE `media_preferences`');
    await queryRunner.query('DROP TABLE `participants`');
    await queryRunner.query('DROP TABLE `sessions`');
    await queryRunner.query('DROP TABLE `virtual_backgrounds`');
    await queryRunner.query('DROP TABLE `principals`');
  }
}
