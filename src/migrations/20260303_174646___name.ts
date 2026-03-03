import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('super_admin', 'moderator', 'api_user');
  CREATE TYPE "public"."enum_events_status" AS ENUM('review', 'published', 'rejected', 'archived');
  CREATE TYPE "public"."enum_events_conflict_type" AS ENUM('airstrike', 'artillery_shelling', 'ground_combat', 'naval_strike', 'drone_strike', 'missile_strike', 'roadside_bomb', 'vbied', 'suicide_bombing', 'landmine', 'assassination', 'coup_attempt', 'massacre', 'ethnic_violence', 'protest', 'riot', 'civil_unrest', 'strike_action', 'civilian_casualties', 'mass_displacement', 'aid_blockade', 'famine', 'infrastructure_bridge_road', 'infrastructure_power', 'infrastructure_hospital', 'infrastructure_port', 'other');
  CREATE TYPE "public"."enum_events_verification_status" AS ENUM('unverified', 'community_verified', 'cross_source_confirmed');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('review', 'published', 'rejected', 'archived');
  CREATE TYPE "public"."enum__events_v_version_conflict_type" AS ENUM('airstrike', 'artillery_shelling', 'ground_combat', 'naval_strike', 'drone_strike', 'missile_strike', 'roadside_bomb', 'vbied', 'suicide_bombing', 'landmine', 'assassination', 'coup_attempt', 'massacre', 'ethnic_violence', 'protest', 'riot', 'civil_unrest', 'strike_action', 'civilian_casualties', 'mass_displacement', 'aid_blockade', 'famine', 'infrastructure_bridge_road', 'infrastructure_power', 'infrastructure_hospital', 'infrastructure_port', 'other');
  CREATE TYPE "public"."enum__events_v_version_verification_status" AS ENUM('unverified', 'community_verified', 'cross_source_confirmed');
  CREATE TYPE "public"."enum_sources_platform" AS ENUM('reddit', 'twitter', 'telegram', 'news_wire', 'other');
  CREATE TYPE "public"."enum_media_attachments_media_type" AS ENUM('article_link', 'image_link', 'video_link');
  CREATE TYPE "public"."enum_media_attachments_platform" AS ENUM('reddit', 'youtube', 'twitter', 'telegram', 'news_site', 'other');
  CREATE TYPE "public"."enum_agent_runs_errors_stage" AS ENUM('reddit_fetch', 'claude_extraction', 'geocoding', 'deduplication', 'database_write', 'other');
  CREATE TYPE "public"."enum_agent_runs_status" AS ENUM('running', 'completed', 'failed', 'completed_with_errors');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'moderator' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "events_parties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_events_status" DEFAULT 'review' NOT NULL,
  	"description" varchar,
  	"conflict_type" "enum_events_conflict_type" NOT NULL,
  	"severity" numeric NOT NULL,
  	"location_name" varchar,
  	"country" varchar,
  	"region" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"event_date" timestamp(3) with time zone,
  	"confidence_score" numeric,
  	"verification_status" "enum_events_verification_status" DEFAULT 'unverified',
  	"has_footage" boolean DEFAULT false,
  	"is_graphic" boolean DEFAULT false,
  	"ai_extraction_notes" varchar,
  	"moderator_notes" varchar,
  	"agent_run_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer,
  	"media_attachments_id" integer
  );
  
  CREATE TABLE "_events_v_version_parties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_status" "enum__events_v_version_status" DEFAULT 'review' NOT NULL,
  	"version_description" varchar,
  	"version_conflict_type" "enum__events_v_version_conflict_type" NOT NULL,
  	"version_severity" numeric NOT NULL,
  	"version_location_name" varchar,
  	"version_country" varchar,
  	"version_region" varchar,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_event_date" timestamp(3) with time zone,
  	"version_confidence_score" numeric,
  	"version_verification_status" "enum__events_v_version_verification_status" DEFAULT 'unverified',
  	"version_has_footage" boolean DEFAULT false,
  	"version_is_graphic" boolean DEFAULT false,
  	"version_ai_extraction_notes" varchar,
  	"version_moderator_notes" varchar,
  	"version_agent_run_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer,
  	"media_attachments_id" integer
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum_sources_platform" DEFAULT 'reddit' NOT NULL,
  	"post_id" varchar NOT NULL,
  	"post_url" varchar NOT NULL,
  	"subreddit" varchar,
  	"post_title" varchar,
  	"post_body" varchar,
  	"posted_at" timestamp(3) with time zone,
  	"upvotes" numeric,
  	"upvote_ratio" numeric,
  	"flair" varchar,
  	"raw_extraction_input" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_attachments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_type" "enum_media_attachments_media_type" DEFAULT 'article_link' NOT NULL,
  	"url" varchar NOT NULL,
  	"thumbnail_url" varchar,
  	"platform" "enum_media_attachments_platform",
  	"title" varchar,
  	"is_graphic" boolean DEFAULT false,
  	"content_warning" varchar,
  	"verified_authentic" boolean DEFAULT false,
  	"verification_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "agent_runs_subreddits_checked" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"posts_fetched" numeric,
  	"posts_passed_filter" numeric
  );
  
  CREATE TABLE "agent_runs_errors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stage" "enum_agent_runs_errors_stage",
  	"message" varchar NOT NULL,
  	"post_id" varchar
  );
  
  CREATE TABLE "agent_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"run_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_agent_runs_status" DEFAULT 'running' NOT NULL,
  	"posts_processed" numeric,
  	"events_created" numeric,
  	"events_updated" numeric,
  	"events_deduplicated" numeric,
  	"posts_skipped" numeric,
  	"duration_ms" numeric,
  	"claude_api_calls" numeric,
  	"geocoding_calls" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"events_id" integer,
  	"sources_id" integer,
  	"media_attachments_id" integer,
  	"agent_runs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_parties" ADD CONSTRAINT "events_parties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_attachments_fk" FOREIGN KEY ("media_attachments_id") REFERENCES "public"."media_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_parties" ADD CONSTRAINT "_events_v_version_parties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("version_agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_attachments_fk" FOREIGN KEY ("media_attachments_id") REFERENCES "public"."media_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_runs_subreddits_checked" ADD CONSTRAINT "agent_runs_subreddits_checked_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_runs_errors" ADD CONSTRAINT "agent_runs_errors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_attachments_fk" FOREIGN KEY ("media_attachments_id") REFERENCES "public"."media_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agent_runs_fk" FOREIGN KEY ("agent_runs_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "events_parties_order_idx" ON "events_parties" USING btree ("_order");
  CREATE INDEX "events_parties_parent_id_idx" ON "events_parties" USING btree ("_parent_id");
  CREATE INDEX "events_agent_run_idx" ON "events" USING btree ("agent_run_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_sources_id_idx" ON "events_rels" USING btree ("sources_id");
  CREATE INDEX "events_rels_media_attachments_id_idx" ON "events_rels" USING btree ("media_attachments_id");
  CREATE INDEX "_events_v_version_parties_order_idx" ON "_events_v_version_parties" USING btree ("_order");
  CREATE INDEX "_events_v_version_parties_parent_id_idx" ON "_events_v_version_parties" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_agent_run_idx" ON "_events_v" USING btree ("version_agent_run_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_sources_id_idx" ON "_events_v_rels" USING btree ("sources_id");
  CREATE INDEX "_events_v_rels_media_attachments_id_idx" ON "_events_v_rels" USING btree ("media_attachments_id");
  CREATE UNIQUE INDEX "sources_post_id_idx" ON "sources" USING btree ("post_id");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "media_attachments_updated_at_idx" ON "media_attachments" USING btree ("updated_at");
  CREATE INDEX "media_attachments_created_at_idx" ON "media_attachments" USING btree ("created_at");
  CREATE INDEX "agent_runs_subreddits_checked_order_idx" ON "agent_runs_subreddits_checked" USING btree ("_order");
  CREATE INDEX "agent_runs_subreddits_checked_parent_id_idx" ON "agent_runs_subreddits_checked" USING btree ("_parent_id");
  CREATE INDEX "agent_runs_errors_order_idx" ON "agent_runs_errors" USING btree ("_order");
  CREATE INDEX "agent_runs_errors_parent_id_idx" ON "agent_runs_errors" USING btree ("_parent_id");
  CREATE INDEX "agent_runs_updated_at_idx" ON "agent_runs" USING btree ("updated_at");
  CREATE INDEX "agent_runs_created_at_idx" ON "agent_runs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_media_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("media_attachments_id");
  CREATE INDEX "payload_locked_documents_rels_agent_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("agent_runs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "events_parties" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_parties" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "media_attachments" CASCADE;
  DROP TABLE "agent_runs_subreddits_checked" CASCADE;
  DROP TABLE "agent_runs_errors" CASCADE;
  DROP TABLE "agent_runs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_events_conflict_type";
  DROP TYPE "public"."enum_events_verification_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_version_conflict_type";
  DROP TYPE "public"."enum__events_v_version_verification_status";
  DROP TYPE "public"."enum_sources_platform";
  DROP TYPE "public"."enum_media_attachments_media_type";
  DROP TYPE "public"."enum_media_attachments_platform";
  DROP TYPE "public"."enum_agent_runs_errors_stage";
  DROP TYPE "public"."enum_agent_runs_status";`)
}
