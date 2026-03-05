CREATE TABLE "setting" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"appearance_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "setting_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "setting" ADD CONSTRAINT "setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;