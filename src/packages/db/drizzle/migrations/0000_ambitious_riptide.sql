CREATE SCHEMA "furnigo";
--> statement-breakpoint
CREATE TABLE "furnigo"."chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "furnigo"."chat_participant" (
	"chat_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_participant_chat_id_user_id_pk" PRIMARY KEY("chat_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "furnigo"."message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"sender_id" uuid,
	"sender_role" varchar(20) NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content" jsonb NOT NULL,
	"label" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "furnigo"."otp_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "furnigo"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar(20) NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"locale" varchar(10) DEFAULT 'en-AU',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "furnigo"."chat_participant" ADD CONSTRAINT "chat_participant_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "furnigo"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furnigo"."chat_participant" ADD CONSTRAINT "chat_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "furnigo"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furnigo"."message" ADD CONSTRAINT "message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "furnigo"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "furnigo"."message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "furnigo"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "otp_code_email_active_idx" ON "furnigo"."otp_code" USING btree ("email") WHERE verified_at IS NULL;