/**
 * dsh-chinese-talk — 让所有会话的思考与交付说中文。
 *
 * 做法只有一件事：往 system prompt 里注册一条**全局** section。全局即所有 scope
 * 可见 —— 主会话、子代理、工作流子代理都吃这条（`section()` 的文档：scoped 同名
 * 会 shadow global，重复同名同层才抛错，所以自占一个名字即可）。
 *
 * 三条刻意的取舍：
 *
 *  1. **不用 `@deepseek-ai/dsh-persona` 的那两个保留 section 名**
 *     （`deployment:persona-prefix` / `-suffix`）。那个包自己写明：全局注册这两个
 *     名字会与 prompt registry 自带的注册相撞并 fail loud。故自取
 *     `dsh-chinese-talk:language`。
 *  2. **不设 `complete: true`。** assemble 收尾会把生效的 complete section 变成
 *     **唯一** section（见 dsh-system-prompt 的 `sections: [completeSection]`），
 *     而且同时存在两个 complete 会直接抛错。语言规则没资格独占整个 prompt。
 *  3. **order = 10**，紧跟人设段（`DEPLOYMENT_PERSONA_PREFIX` = 0）之后、早于全部
 *     工具说明：语言是"怎么说话"的事，属人设层，不该埋在工具清单里。
 *
 * 不改工具、不改 DOM、无 client 半边、无配置项 —— 一段文本而已。
 */
export const name = 'dsh-chinese-talk'

/** 依赖 prompt registry；缺它时本插件不该假装生效。 */
export const inject = ['systemPrompt']

/** 自占的 section 名（带包名前缀，避开保留名与别家插件）。 */
const SECTION_NAME = 'dsh-chinese-talk:language'

/** 紧跟人设之后：`DEPLOYMENT_PERSONA_PREFIX` = 0，工具说明自 500 起。 */
const ORDER = 10

/**
 * 规则正文。改风格就改这一处；请保持简短——它每轮请求都要过一遍。
 *
 * 分条备注（哪条管什么）：
 * - 第 1~7 条：语言与腔调 —— 中文、简洁、略文言、说人话带俏皮、专有名词英文原形、
 *   引用与标识符不译、用户当轮吩咐优先、与其它语言约定冲突时以本条为准。
 * - 第 8 条（只答所问）：交互方式 —— 问什么答什么，不主动跑命令、不堆可复制命令清单。
 * - 第 9 条（唯一例外）：会改文件 / 改系统 / 撤不回来时，附一句提醒。
 *
 * 生效范围与边界（重要）：
 * - 本 section 为**全局**注册（`ORDER = 10`，紧跟人设段之后），主会话、子代理、
 *   工作流子代理都吃这条。
 * - **第 8、9 条同样受下面的边界限制，不是只影响第 1~7 条。**
 * - **极简预设（minimal preset）下整条 section 都不生效**：它内嵌的 persona 带
 *   `complete: true`（见 `profiles/desktop/cordis.yml` 的 `- id: preset-minimal`），
 *   `systemPrompt.assemble()` 会把最终 prompt 收成那一条 complete section
 *   （`sections: [completeSection]`），本 section 连同第 8、9 条一起被顶掉。
 * - 推广之：任何带 complete persona 的 preset / 子代理作用域，都会顶掉本 section。
 * - 想临时关掉本插件：profile 的 `cordis.patch.yml` 里给
 *   `- id: dsh-chinese-talk` 加 `disabled: true`（无需卸载）。
 */
const TEXT = `【中文思考】思考（thinking）与交付，概用中文。此条不管任务内容，只管怎么说话。

- 简洁为先：「用」替「使用」，「做」替「进行」，「能」替「可以」。一字能说清，不写两字。
- 略沾文言：宜、勿、既、遂、姑且——点到辄止，勿通篇之乎者也。
- 说人话，带三分俏皮：像同熟人闲谈，不像念公文。玩笑可开，含糊不可。
- 专有名词照旧：API、命令、路径、文件名、字段、类名、错误码、库名、版本号，一律英文原形，勿译。
- 代码标识符、日志、commit type 不动；他人原文、报错、文档片段照抄，勿译。
- 用户当轮另有吩咐（要英文、要别的腔调）→ 听用户的，此条退让。
- 本条与前文任何语言/风格约定相抵时，以本条为准（用户当轮指令除外）。
- 只答所问：问什么答什么，一屏说清；不主动跑命令、不附「顺手还能这样」、不堆可复制命令清单。要动手，等发话。
- 唯一例外：该步会改文件、改系统或撤不回来时，附一句提醒。`

/**
 * 注册这条 section。`ctx.effect` 管生死：插件卸载/禁用时 disposer 一跑，
 * prompt registry 立刻发 `system-prompt/change`，下一轮请求即恢复原样。
 */
export function apply(ctx) {
  ctx.effect(
    () => ctx.systemPrompt.section({ name: SECTION_NAME, order: ORDER, text: TEXT }),
    'chinese-thinking.section()',
  )
}
