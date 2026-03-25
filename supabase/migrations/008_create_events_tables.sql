-- Migration: 008_create_events_tables

CREATE TYPE event_category AS ENUM ('academic', 'sports', 'cultural', 'organization', 'administrative');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category event_category NOT NULL,
  venue VARCHAR(200) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  rsvp_enabled BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_rsvps_event ON event_rsvps(event_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_events ON events FOR SELECT USING (true);
CREATE POLICY own_rsvps ON event_rsvps FOR SELECT USING (user_id = auth.uid());
CREATE POLICY manage_own_rsvps ON event_rsvps FOR ALL USING (user_id = auth.uid());
CREATE POLICY admin_manage_events ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_staff WHERE user_id = auth.uid()));
