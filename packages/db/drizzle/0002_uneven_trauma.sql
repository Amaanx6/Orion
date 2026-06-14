CREATE TABLE "pr_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" text NOT NULL,
	"repo" text NOT NULL,
	"pr_number" integer NOT NULL,
	"sha" text NOT NULL,
	"installation_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"summary" text,
	"comment_url" text,
	"findings" jsonb,
	"total_files" integer,
	"total_findings" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
