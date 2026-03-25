-- Migration: 007_create_news_tables

CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  thumbnail_url TEXT,
  author_name VARCHAR(100) NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);

CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_subs_user ON news_subscriptions(user_id);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_news ON news_articles FOR SELECT USING (true);
CREATE POLICY own_subscriptions ON news_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY manage_own_subscriptions ON news_subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY admin_manage_news ON news_articles FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
