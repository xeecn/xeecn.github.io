/* ==========================================================================
   Nalxer · 入场动画脚本（滚到才播）
   ==========================================================================
   设计要点
   --------------------------------------------------------------------------
   1. **默认可见**：HTML 里的模块本来就能看见。
      只有脚本确认浏览器支持 IntersectionObserver 时，才给它们挂上 .anim
      把初始状态设为隐藏。所以：
        脚本没加载 / JS 被禁用 / 老浏览器 → 内容正常显示，不会白屏。
   2. 只动 transform 与 opacity（合成层动画），不碰 backdrop-filter，
      低端机也不会因为动画掉帧。
   3. 元素进入视口播一次就移除观察，不再重复计算。
   4. 逐个错开一点（stagger），看起来是"依次涌现"而不是一起弹出。
   5. 尊重 prefers-reduced-motion：直接放行，不播动画。
   ========================================================================== */
(function () {
    'use strict';

    // ① 能力与偏好检查：不满足就什么都不做，页面保持默认可见
    if (!('IntersectionObserver' in window)) return;

    var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.matches) return;

    // ② 要参与入场的模块（与 site-theme.css 里的 .anim 配套）
    var SELECTOR = [
        '.header',
        '.copy-ip-wrap',
        '.info-grid',
        '.features',
        '.rules-link',
        '.sponsor-card',
        '.link-card',
        '.description',
        '.gallery',
        '.steps',
        '.cmds',
        '.join',
        '.rules',
        '.notice',
        '.pay-tabs',
        '.pay-panel.active',
        '.payment-section',
        '.payment-code-container',
        '.qr-section',
        '.category',
        '.project-list',
        '.project-card',
        '.tool-card',
        '.main-content > *',
        '.rule-list',
        '.penalty-table',
        '.rule-foot',
        '.law-note',
        '.tip',
        '.footer'
    ].join(',');

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    ready(function () {
        var nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
        if (!nodes.length) return;

        // ③ 先挂隐藏状态（此时 JS 已确认可用，安全）
        nodes.forEach(function (el) { el.classList.add('anim'); });

        // ④ 同一批里按顺序错开；用 data-anim-d 记录已给的延迟
        var io = new IntersectionObserver(function (entries) {
            // 同一次回调里的元素，按其在页面中的先后给不同延迟
            var batch = entries.filter(function (e) { return e.isIntersecting; });
            batch.sort(function (a, b) {
                var ra = a.target.getBoundingClientRect().top;
                var rb = b.target.getBoundingClientRect().top;
                return ra - rb;
            });
            batch.forEach(function (e, i) {
                var el = e.target;
                var delay = Math.min(i * 60, 300);
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('in');
                // 播完清掉延迟与观察，避免影响后续交互
                window.setTimeout(function () {
                    el.style.transitionDelay = '';
                }, delay + 900);
                io.unobserve(el);
            });
        }, {
            // 元素露出 12% 或距底 60px 内就触发，避免"滚过头才出现"
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        nodes.forEach(function (el) { io.observe(el); });

        // ⑤ 兜底：极端情况下（例如页面很短、元素在视口内但 IO 没回调），
        //    2.5 秒后把所有还没播的直接显示出来，保证不会一直隐形。
        window.setTimeout(function () {
            nodes.forEach(function (el) {
                if (!el.classList.contains('in')) {
                    el.classList.add('in');
                    io.unobserve(el);
                }
            });
        }, 2500);
    });
}());
