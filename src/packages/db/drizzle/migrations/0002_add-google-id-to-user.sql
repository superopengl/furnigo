ALTER TABLE "furnigo"."user" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "furnigo"."user" ADD CONSTRAINT "user_google_id_unique" UNIQUE("google_id");