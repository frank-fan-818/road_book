/**
 * 百度地图API配置管理模块
 * 统一管理百度地图API Key和相关配置
 */

// 从环境变量读取API Key
const BAIDU_MAP_AK = import.meta.env.VITE_BAIDU_MAP_AK;

/**
 * 检查API Key是否配置
 * @returns {boolean} 是否配置了有效API Key
 */
export function isBaiduMapConfigured() {
  return !!BAIDU_MAP_AK && BAIDU_MAP_AK.trim() !== '';
}

/**
 * 获取API Key
 * @returns {string} API Key
 * @throws {Error} 如果API Key未配置则抛出错误
 */
export function getBaiduMapAK() {
  if (!isBaiduMapConfigured()) {
    throw new Error('百度地图API Key未配置，请在环境变量中设置 VITE_BAIDU_MAP_AK');
  }
  return BAIDU_MAP_AK;
}

/**
 * 百度地图API错误类型
 */
export const BaiduMapErrorType = {
  MISSING_AK: 'MISSING_AK',
  INVALID_AK: 'INVALID_AK',
  LOAD_FAILED: 'LOAD_FAILED',
  RENDER_ERROR: 'RENDER_ERROR',
};

/**
 * 创建百度地图错误
 * @param {string} type 错误类型
 * @param {string} message 错误信息
 * @returns {Error} 错误对象
 */
export function createBaiduMapError(type, message) {
  const error = new Error(message);
  error.name = 'BaiduMapError';
  error.type = type;
  return error;
}

export default {
  isBaiduMapConfigured,
  getBaiduMapAK,
  BaiduMapErrorType,
  createBaiduMapError,
};
