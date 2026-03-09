const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY;

const SYSTEM_PROMPT = `你是一个专业的旅行规划助手。用户会告诉你他们的旅行意愿，你需要生成一个详细的行程安排。

请严格按照以下JSON格式返回，不要包含任何其他文字说明：

{
  "trip_id": "唯一标识符，格式如 europe_001",
  "title": "行程标题",
  "days": [
    {
      "day": 1,
      "date": "日期，格式 YYYY-MM-DD",
      "activities": [
        {
          "time": "时间，格式 HH:MM",
          "loc": "地点名称",
          "desc": "活动描述",
          "type": "类型：culture/food/shopping/entertainment",
          "duration": "建议时长",
          "ticket": "门票情况",
          "tips": "小贴士"
        }
      ],
      "ai_tips": "当天的AI建议"
    }
  ]
}

注意事项：
1. 根据用户指定的天数生成对应数量的天数
2. 每天安排3-5个活动
3. 活动时间要合理安排，考虑交通和休息
4. 包含当地特色景点和美食
5. 返回纯JSON，不要有markdown代码块标记`;

export async function generateItineraryWithAI(userPrompt) {
  if (!ZHIPU_API_KEY) {
    throw new Error('请配置 VITE_ZHIPU_API_KEY 环境变量');
  }

  const today = new Date();
  const defaultDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dateStr = defaultDate.toISOString().split('T')[0];

  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `${userPrompt}\n\n请从${dateStr}开始安排行程。`
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`智谱API错误: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  try {
    return JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON解析错误，原始内容:', jsonStr);
    throw new Error('AI返回的数据格式不正确，请重试');
  }
}
