DROP INDEX "furnigo"."otp_code_email_active_idx";--> statement-breakpoint
ALTER TABLE "furnigo"."otp_code" ADD CONSTRAINT "otp_code_email_unique" UNIQUE("email");