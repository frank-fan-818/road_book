-- 1. 创建旅行行程表 (trips)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  destination TEXT,
  days_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建每日行程表 (trip_days)
CREATE TABLE trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT REFERENCES trips(trip_id) ON DELETE CASCADE,
  day_num INTEGER NOT NULL,
  date TEXT NOT NULL,
  ai_tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建活动/景点表 (activities)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT REFERENCES trips(trip_id) ON DELETE CASCADE,
  day_num INTEGER NOT NULL,
  time TEXT NOT NULL,
  loc TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('culture', 'food', 'shopping', 'entertainment')),
  duration TEXT,
  ticket TEXT,
  tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 启用 RLS (行级安全策略)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 5. 创建公开读取策略 (anon key 可以读取)
CREATE POLICY "Public trips are viewable by everyone" ON trips FOR SELECT USING (true);
CREATE POLICY "Public days are viewable by everyone" ON trip_days FOR SELECT USING (true);
CREATE POLICY "Public activities are viewable by everyone" ON activities FOR SELECT USING (true);

-- 6. 允许匿名写入 (anon key 可以插入)
CREATE POLICY "Anyone can insert trips" ON trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert days" ON trip_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert activities" ON activities FOR INSERT WITH CHECK (true);

-- 7. 创建索引提升查询性能
CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX idx_activities_trip_id ON activities(trip_id);
CREATE INDEX idx_activities_day_num ON activities(trip_id, day_num);
