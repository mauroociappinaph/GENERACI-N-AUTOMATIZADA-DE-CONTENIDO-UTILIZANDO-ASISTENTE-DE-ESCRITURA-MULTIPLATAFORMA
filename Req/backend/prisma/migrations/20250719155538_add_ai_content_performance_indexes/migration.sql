-- Additional performance indexes for AI content system

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_generated_content_platform_language" ON "generated_content"("platform", "language");
CREATE INDEX IF NOT EXISTS "idx_generated_content_tone_category" ON "generated_content"("tone", "template_id");
CREATE INDEX IF NOT EXISTS "idx_generated_content_quality_score" ON "generated_content"("quality_score") WHERE "quality_score" IS NOT NULL;

-- Indexes for content templates
CREATE INDEX IF NOT EXISTS "idx_content_templates_category_platform" ON "content_templates"("category", "is_active");
CREATE INDEX IF NOT EXISTS "idx_content_templates_language_tone" ON "content_templates"("language", "tone");

-- Indexes for social media accounts
CREATE INDEX IF NOT EXISTS "idx_social_accounts_platform_active" ON "social_media_accounts"("platform", "is_active");
CREATE INDEX IF NOT EXISTS "idx_social_accounts_user_platform" ON "social_media_accounts"("user_id", "platform");

-- Indexes for scheduled posts
CREATE INDEX IF NOT EXISTS "idx_scheduled_posts_status_scheduled" ON "scheduled_posts"("status", "scheduled_for");
CREATE INDEX IF NOT EXISTS "idx_scheduled_posts_user_status" ON "scheduled_posts"("created_by", "status");

-- Indexes for content performance
CREATE INDEX IF NOT EXISTS "idx_content_performance_analyzed_date" ON "content_performance"("analyzed_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_content_performance_platform_date" ON "content_performance"("platform", "analyzed_at" DESC);

-- Indexes for content feedback
CREATE INDEX IF NOT EXISTS "idx_content_feedback_rating" ON "content_feedback"("rating") WHERE "rating" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_content_feedback_type_rating" ON "content_feedback"("feedback_type", "rating");

-- Indexes for translation cache
CREATE INDEX IF NOT EXISTS "idx_translation_cache_languages" ON "translation_cache"("source_language", "target_language");
CREATE INDEX IF NOT EXISTS "idx_translation_cache_provider" ON "translation_cache"("provider", "created_at" DESC);

-- Indexes for analytics summary
CREATE INDEX IF NOT EXISTS "idx_analytics_summary_period" ON "content_analytics_summary"("period_start", "period_end");
CREATE INDEX IF NOT EXISTS "idx_analytics_summary_user_period" ON "content_analytics_summary"("user_id", "period_start" DESC);

-- Additional indexes for vector similarity search
CREATE INDEX IF NOT EXISTS "idx_vector_index_platform_category" ON "vector_index"("platform", "category");
CREATE INDEX IF NOT EXISTS "idx_vector_index_language_category" ON "vector_index"("language", "category");
