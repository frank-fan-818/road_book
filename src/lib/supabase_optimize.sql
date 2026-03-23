-- Supabase数据库优化SQL脚本
-- 执行此脚本前请备份数据

-- ==============================================
-- 1. 基础约束修复（解决插入失败问题）
-- ==============================================

-- 为trip_days表添加trip_id和day_num的联合唯一约束
ALTER TABLE trip_days
ADD CONSTRAINT unique_trip_day UNIQUE (trip_id, day_num);

-- 为activities表添加trip_id、day_num、time的联合唯一约束
ALTER TABLE activities
ADD CONSTRAINT unique_trip_day_activity UNIQUE (trip_id, day_num, time);

-- ==============================================
-- 2. 新增字段（适配地图和优化功能）
-- ==============================================

-- activities表新增地址和坐标字段
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS lng NUMERIC,
ADD COLUMN IF NOT EXISTS lat NUMERIC;

-- trip_days表新增统计字段
ALTER TABLE trip_days
ADD COLUMN IF NOT EXISTS total_distance NUMERIC,
ADD COLUMN IF NOT EXISTS transport_type TEXT;

-- trips表新增创建时间字段
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ==============================================
-- 3. 可选：创建索引提升查询性能
-- ==============================================

-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_trips_trip_id ON trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_coords ON activities(lng, lat);

-- ==============================================
-- 4. 可选：启用行级安全策略（RLS）
-- ==============================================

-- -- 如果需要公开访问，可以设置为允许所有操作（开发环境）
-- ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations for all users" ON trips FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for all users" ON trip_days FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for all users" ON activities FOR ALL USING (true);
