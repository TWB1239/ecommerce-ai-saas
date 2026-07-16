/**
 * AI 联网搜索工具
 *
 * 在调用 DeepSeek 之前，先搜索网络获取实时数据，
 * 把搜索结果作为上下文注入到 AI 的请求中。
 *
 * 目前使用 DuckDuckGo Lite API（免费，无需 API Key）
 * 可扩展为 Bing / Google Search API（需要 Key）
 */

export interface SearchResult {
  title: string
  snippet: string
  url: string
}

/**
 * 搜索网络获取实时信息
 * 用于补充 AI 的行业数据、竞品信息、热门趋势等
 */
export async function webSearch(
  query: string,
  limit: number = 5,
): Promise<SearchResult[]> {
  try {
    // 使用 DuckDuckGo Lite API（免费，无认证要求）
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; EcommerceAIAssistant/1.0)',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return []

    const html = await res.text()

    // 解析 DuckDuckGo Lite 的 HTML 结果
    const results: SearchResult[] = []
    const lines = html.split('\n')

    let currentTitle = ''
    let currentSnippet = ''
    let currentUrl = ''
    let inResult = false

    for (const line of lines) {
      const trimmed = line.trim()

      // DuckDuckGo Lite 结果格式：<a href="url" class="result-link">title</a>
      if (trimmed.startsWith('<a href="') && trimmed.includes('class="result-link"')) {
        const urlMatch = trimmed.match(/href="([^"]+)"/)
        const titleMatch = trimmed.match(/>([^<]+)</)
        if (urlMatch && titleMatch) {
          if (currentUrl && results.length < limit) {
            results.push({
              title: currentTitle || '无标题',
              snippet: currentSnippet || '无摘要',
              url: currentUrl,
            })
          }
          currentUrl = urlMatch[1]
          currentTitle = titleMatch[1]
          currentSnippet = ''
          inResult = true
        }
      } else if (inResult && trimmed.startsWith('<td class="result-snippet"')) {
        const snippetMatch = trimmed.match(/>([^<]+)</)
        if (snippetMatch) {
          currentSnippet = snippetMatch[1]
        }
      } else if (inResult && trimmed === '</td>') {
        if (currentUrl && results.length < limit) {
          results.push({
            title: currentTitle || '无标题',
            snippet: currentSnippet || '无摘要',
            url: currentUrl,
          })
        }
        currentUrl = ''
        currentTitle = ''
        currentSnippet = ''
        inResult = false
      }
    }

    // 如果 DuckDuckGo Lite 解析失败，尝试备用方案
    if (results.length === 0) {
      return await fallbackSearch(query, limit)
    }

    return results.slice(0, limit)
  } catch {
    // 搜索失败时静默返回空结果
    return []
  }
}

/**
 * 备用搜索：使用 DuckDuckGo Instant Answer API
 */
async function fallbackSearch(
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    clearTimeout(timeout)

    if (!res.ok) return []

    const data = await res.json()
    const results: SearchResult[] = []

    // RelatedTopics 是主要结果
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= limit) break
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text,
            snippet: topic.Text,
            url: topic.FirstURL,
          })
        }
      }
    }

    return results
  } catch {
    return []
  }
}

/**
 * 格式化搜索结果为 AI 可读的上下文文本
 */
export function formatSearchResults(
  results: SearchResult[],
  query: string,
): string {
  if (results.length === 0) return ''

  let text = `\n\n## 🌐 网络实时搜索结果（搜索词：${query}）\n\n`
  for (const r of results) {
    text += `- **${r.title}**\n  ${r.snippet}\n  ${r.url}\n\n`
  }
  text += `---\n以上数据来源于网络实时搜索，仅供参考。\n`

  return text
}

/**
 * 电商行业参考数据（内置知识库）
 * 用于补充 AI 的行业基准信息
 */
export const ECOMMERCE_BENCHMARKS = `
## 📊 电商行业参考数据（2025-2026） — 全品类覆盖

### 各平台特征
- 淘宝/天猫：搜索流量为主，头部商家垄断明显。适合品牌/非标品，全品类覆盖
- 拼多多：社交裂变+低价策略，极度价格敏感。适合日用百货/食品/小商品
- 京东：品质+物流为核心竞争力。适合家电/数码/品牌日用品/图书
- 抖音/快手：内容直播电商。适合冲动消费/新奇特/高视觉冲击产品
- 小红书：种草决策型电商。适合高颜值/女性向/美妆/母婴/家居

---

### 🏪 各品类经营指标参考（核心数据）

#### ① 服饰鞋包（服装/鞋子/包包/配饰）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 1-3%，拼多多 2-5%，抖音 2-6% |
| 客单价 | 服装 60-200元，鞋子 80-300元，包包 50-500元 |
| 退货率 | **15-30%**（行业最高，尺码/色差问题严重）|
| 广告ROI | 1:2 - 1:5 |
| 复购率 | 15-25%（看款式更新速度）|
| 运营重点 | 款式>价格，上新频率决定流量，尺码表准确度影响退货率 |

#### ② 日用百货（纸巾/衣架/收纳/清洁/厨具）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 3-6%，拼多多 5-10%，京东 3-6% |
| 客单价 | 15-80元 |
| 退货率 | **3-8%**（低退货品类）|
| 广告ROI | 1:3 - 1:8 |
| 复购率 | **20-40%**（高复购，纸巾/湿巾更高）|
| 运营重点 | 性价比>品牌，组合装提升客单，评价积累至关重要 |

#### ③ 食品/饮料/茶叶
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 4-8%，拼多多 6-12%，抖音 3-8% |
| 客单价 | 30-150元 |
| 退货率 | **1-3%**（极低，除非质量问题）|
| 广告ROI | 1:4 - 1:10 |
| 复购率 | **25-45%**（非常高，消耗品）|
| 运营重点 | 食品安全资质，保质期管理，包装防破损，详情页突出产地/工艺 |

#### ④ 美妆/个护（护肤品/化妆品/洗护）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 2-5%，抖音 3-8%，小红书 2-4% |
| 客单价 | 护肤品 50-300元，彩妆 30-150元 |
| 退货率 | 5-12%（过敏等原因）|
| 广告ROI | 1:2 - 1:6 |
| 复购率 | 15-30%（看产品效果）|
| 运营重点 | 成分党兴起，KOL种草效果显著，试用装/小样引流 |

#### ⑤ 家居家装（家具/家纺/灯具/装饰）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 1-3%，京东 2-4% |
| 客单价 | 家纺 50-300元，家具 200-2000元 |
| 退货率 | 8-15%（大件物流损坏/尺寸不符）|
| 广告ROI | 1:2 - 1:5 |
| 复购率 | 10-20%（低频，看新房/换新周期）|
| 运营重点 | 场景图至关重要，尺寸标注清晰，物流安装服务是核心竞争力 |

#### ⑥ 数码3C（手机配件/耳机/智能设备/电脑外设）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 2-5%，京东 3-6% |
| 客单价 | 手机壳/配件 10-100元，耳机/音箱 50-500元 |
| 退货率 | 5-12%（兼容性问题/不满意）|
| 广告ROI | 1:2 - 1:6 |
| 复购率 | 10-20%（看更新换代频率）|
| 运营重点 | 参数清晰，兼容性说明详细，评测视频有帮助 |

#### ⑦ 母婴用品（奶粉/纸尿裤/玩具/童装）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 3-6%，京东 4-7% |
| 客单价 | 50-300元 |
| 退货率 | 3-8%（安全考虑，部分品类不支持无理由退货）|
| 广告ROI | 1:3 - 1:7 |
| 复购率 | **30-50%**（极高，消耗品+品牌忠诚度高）|
| 运营重点 | 安全认证（3C等）是信任基础，家长对品质极度敏感，口碑传播强 |

#### ⑧ 运动户外（健身器材/户外装备/运动鞋服）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 2-4%，京东 3-5% |
| 客单价 | 运动服 80-300元，器材 100-1000元 |
| 退货率 | 10-18%（尺码/不合适）|
| 广告ROI | 1:2 - 1:5 |
| 复购率 | 15-25% |
| 运营重点 | 功能性说明，尺码推荐，使用场景展示 |

#### ⑨ 珠宝首饰/手表/配饰
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 1-3%，抖音 3-7% |
| 客单价 | 银饰 50-300元，金饰/玉石 500-5000+元 |
| 退货率 | 5-15%（真假/成色争议）|
| 广告ROI | 1:2 - 1:8（高客单ROI更高）|
| 复购率 | 10-20%（送礼+自购场景）|
| 运营重点 | 证书/鉴定报告是信任核心，直播展示效果极好，高客单需要品牌背书 |

#### ⑩ 图书/文具/教育
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 4-8%，京东 5-10% |
| 客单价 | 图书 20-80元，文具 10-50元 |
| 退货率 | 1-5%（极低）|
| 广告ROI | 1:3 - 1:8 |
| 复购率 | 15-25% |
| 运营重点 | 正版保证，版本/出版社信息清晰，套装提升客单价 |

#### ⑪ 宠物用品（猫粮/狗粮/宠物玩具/宠物窝具）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 3-6%，拼多多 5-9% |
| 客单价 | 30-200元 |
| 退货率 | 3-8% |
| 广告ROI | 1:3 - 1:7 |
| 复购率 | **30-50%**（消耗品，极高）|
| 运营重点 | 成分安全是核心，宠物主愿意为品质付费 |

#### ⑫ 汽车用品（车载配件/清洁/装饰）
| 指标 | 参考值 |
|:----|:-------|
| 转化率 | 淘宝 2-5%，京东 3-6% |
| 客单价 | 20-300元 |
| 退货率 | 5-12%（适配问题）|
| 广告ROI | 1:2 - 1:6 |
| 复购率 | 10-20% |
| 运营重点 | 车型适配说明必须详细 |

---

### 📐 标题优化通用规范
- 淘宝标题：20-30字（30字最佳，核心词前置）
- 拼多多标题：15-25字（前台展示约22字）
- 京东标题：25-40字（可包含更多参数词）
- 标题公式：核心卖点 + 场景词 + 属性词 + 长尾词
- 所有平台：前12个字决定搜索匹配权重，最重要关键词放最前面

### 🎬 直播带货通用参考
- 平均停留时长：30秒-2分钟
- 转化率：1-5%（好货可达10%+）
- 最佳直播时长：2-4小时
- 开场前3分钟决定40%的留存率
- 每15分钟一个互动节点

### 📝 评价管理通用参考
- 好评率 98%+ 为优秀，95-98% 正常，低于95%需警惕
- 差评回复率应在24小时内
- 典型差评分布：质量问题40%、物流25%、描述不符20%、客服态度10%、其他5%
- 不同品类差评重点不同：服饰→尺码色差，食品→保质期口味，数码→兼容性，家具→安装物流

### 📅 通用月度运营节奏
- 月初：复盘上月数据，制定本月计划
- 月中：执行优化，关注平台活动报名
- 月末：冲销量，清理库存，为下月上新准备
`

/**
 * 获取带有行业参考数据的增强提示
 */
export function getEnhancedSystemPrompt(
  basePrompt: string,
  withWebSearch: boolean = false,
): string {
  let enhanced = basePrompt

  // 追加行业参考数据
  enhanced += `\n\n## 附：行业参考数据\n${ECOMMERCE_BENCHMARKS}`

  if (withWebSearch) {
    enhanced += `\n\n## 联网能力说明\n如果用户提供了需要实时数据的问题（如"现在什么品最火""最近什么关键词流量大"），你可以在回答中说明：\n"如需获取最新的行业动态和实时数据，系统支持联网搜索功能。用户可以在输入时注明【联网搜索】，系统将自动查询网络最新信息。"\n`
  }

  return enhanced
}
