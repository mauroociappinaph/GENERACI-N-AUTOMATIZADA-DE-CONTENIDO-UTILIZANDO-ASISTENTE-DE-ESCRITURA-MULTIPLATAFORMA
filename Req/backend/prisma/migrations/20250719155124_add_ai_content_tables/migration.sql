-- CreateTable
CREATE TABLE "content_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platforms" JSONB NOT NULL,
    "prompt_template" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "tone" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "content_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_id" TEXT,
    "content" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "tone" TEXT NOT NULL,
    "quality_score" REAL,
    "sentiment_score" JSONB,
    "seo_score" JSONB,
    "readability_score" REAL,
    "suggestions" JSONB,
    "parameters" JSONB,
    "vectorEmbedding" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_content_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "content_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "generated_content_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_media_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "permissions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "connected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "social_media_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content_id" TEXT NOT NULL,
    "scheduled_for" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "platform_specific_content" JSONB,
    "mediaAttachments" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "scheduled_posts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "generated_content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scheduled_posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "publishing_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduled_post_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "platform_post_id" TEXT,
    "error_message" TEXT,
    "published_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "publishing_results_scheduled_post_id_fkey" FOREIGN KEY ("scheduled_post_id") REFERENCES "scheduled_posts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "publishing_results_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "social_media_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platform_post_id" TEXT,
    "metrics" JSONB NOT NULL,
    "engagement" JSONB,
    "reach" JSONB,
    "conversions" JSONB,
    "analyzed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_performance_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "generated_content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "rating" INTEGER,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_feedback_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "generated_content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "translation_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_content_hash" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "translated_content" TEXT NOT NULL,
    "confidence" REAL,
    "culturalAdaptations" JSONB,
    "provider" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "translation_cache_source_content_hash_fkey" FOREIGN KEY ("source_content_hash") REFERENCES "generated_content" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "content_analytics_summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "total_content_generated" INTEGER NOT NULL DEFAULT 0,
    "total_posts_published" INTEGER NOT NULL DEFAULT 0,
    "avg_quality_score" REAL,
    "avg_engagement_rate" REAL,
    "top_performing_platforms" JSONB NOT NULL,
    "recommendations" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_analytics_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vector_index" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content_id" TEXT NOT NULL,
    "vector_embedding" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_PostAccounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PostAccounts_A_fkey" FOREIGN KEY ("A") REFERENCES "scheduled_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PostAccounts_B_fkey" FOREIGN KEY ("B") REFERENCES "social_media_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "content_templates_category_idx" ON "content_templates"("category");

-- CreateIndex
CREATE INDEX "content_templates_is_active_idx" ON "content_templates"("is_active");

-- CreateIndex
CREATE INDEX "content_templates_created_by_idx" ON "content_templates"("created_by");

-- CreateIndex
CREATE INDEX "generated_content_template_id_idx" ON "generated_content"("template_id");

-- CreateIndex
CREATE INDEX "generated_content_platform_idx" ON "generated_content"("platform");

-- CreateIndex
CREATE INDEX "generated_content_created_by_idx" ON "generated_content"("created_by");

-- CreateIndex
CREATE INDEX "generated_content_created_at_idx" ON "generated_content"("created_at");

-- CreateIndex
CREATE INDEX "social_media_accounts_user_id_idx" ON "social_media_accounts"("user_id");

-- CreateIndex
CREATE INDEX "social_media_accounts_platform_idx" ON "social_media_accounts"("platform");

-- CreateIndex
CREATE INDEX "social_media_accounts_is_active_idx" ON "social_media_accounts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_accounts_user_id_platform_account_id_key" ON "social_media_accounts"("user_id", "platform", "account_id");

-- CreateIndex
CREATE INDEX "scheduled_posts_content_id_idx" ON "scheduled_posts"("content_id");

-- CreateIndex
CREATE INDEX "scheduled_posts_scheduled_for_idx" ON "scheduled_posts"("scheduled_for");

-- CreateIndex
CREATE INDEX "scheduled_posts_status_idx" ON "scheduled_posts"("status");

-- CreateIndex
CREATE INDEX "scheduled_posts_created_by_idx" ON "scheduled_posts"("created_by");

-- CreateIndex
CREATE INDEX "publishing_results_scheduled_post_id_idx" ON "publishing_results"("scheduled_post_id");

-- CreateIndex
CREATE INDEX "publishing_results_account_id_idx" ON "publishing_results"("account_id");

-- CreateIndex
CREATE INDEX "publishing_results_platform_idx" ON "publishing_results"("platform");

-- CreateIndex
CREATE INDEX "publishing_results_status_idx" ON "publishing_results"("status");

-- CreateIndex
CREATE INDEX "content_performance_content_id_idx" ON "content_performance"("content_id");

-- CreateIndex
CREATE INDEX "content_performance_platform_idx" ON "content_performance"("platform");

-- CreateIndex
CREATE INDEX "content_performance_analyzed_at_idx" ON "content_performance"("analyzed_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_performance_content_id_platform_platform_post_id_key" ON "content_performance"("content_id", "platform", "platform_post_id");

-- CreateIndex
CREATE INDEX "content_feedback_content_id_idx" ON "content_feedback"("content_id");

-- CreateIndex
CREATE INDEX "content_feedback_user_id_idx" ON "content_feedback"("user_id");

-- CreateIndex
CREATE INDEX "content_feedback_feedback_type_idx" ON "content_feedback"("feedback_type");

-- CreateIndex
CREATE INDEX "translation_cache_source_content_hash_idx" ON "translation_cache"("source_content_hash");

-- CreateIndex
CREATE INDEX "translation_cache_source_language_target_language_idx" ON "translation_cache"("source_language", "target_language");

-- CreateIndex
CREATE UNIQUE INDEX "translation_cache_source_content_hash_source_language_target_language_key" ON "translation_cache"("source_content_hash", "source_language", "target_language");

-- CreateIndex
CREATE INDEX "content_analytics_summary_user_id_idx" ON "content_analytics_summary"("user_id");

-- CreateIndex
CREATE INDEX "content_analytics_summary_period_start_period_end_idx" ON "content_analytics_summary"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "content_analytics_summary_user_id_period_start_period_end_key" ON "content_analytics_summary"("user_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "vector_index_platform_idx" ON "vector_index"("platform");

-- CreateIndex
CREATE INDEX "vector_index_category_idx" ON "vector_index"("category");

-- CreateIndex
CREATE INDEX "vector_index_language_idx" ON "vector_index"("language");

-- CreateIndex
CREATE UNIQUE INDEX "vector_index_content_id_key" ON "vector_index"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "_PostAccounts_AB_unique" ON "_PostAccounts"("A", "B");

-- CreateIndex
CREATE INDEX "_PostAccounts_B_index" ON "_PostAccounts"("B");
