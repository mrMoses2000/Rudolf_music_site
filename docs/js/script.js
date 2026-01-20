// --- 1. Mermaid Config (Dark Theme with Error Handling) ---
mermaid.initialize({
    startOnLoad: false, // We will run manually to catch errors
    theme: 'dark',
    securityLevel: 'loose', // Allow HTML in labels
    themeVariables: {
        primaryColor: '#1e293b',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#0f172a',
        tertiaryColor: '#111827'
    },
    flowchart: { curve: 'linear' }
});

// Load MathJax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    svg: { fontCache: 'global' }
};

(function () {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);
})();

// --- 3. Animation Engine ---
document.addEventListener("DOMContentLoaded", async () => {

    // --- Safe Mermaid Render ---
    try {
        await mermaid.run({
            querySelector: '.mermaid'
        });
    } catch (e) {
        console.error("Mermaid Render Error:", e);
        // Fallback or alert if needed, but mermaid usually handles syntax errors visually
    }

    // --- Physics Animations ---
    const skbContainer = document.getElementById('anim-skb');
    if (skbContainer) initSkbAnim(skbContainer);

    const tcpContainer = document.getElementById('anim-tcp');
    if (tcpContainer) initTcpAnim(tcpContainer);

    const loopContainer = document.getElementById('anim-event-loop');
    if (loopContainer) initLoopAnim(loopContainer);

});

// --- ANIMATION: SKB POINTER (Refined) ---
function initSkbAnim(container) {
    container.innerHTML = `
        <div style="position: relative; width: 300px; height: 120px; border: 1px solid #334155; border-radius: 8px; background: #0f172a; padding-top: 20px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
            <!-- Labels -->
            <div style="position: absolute; top: 5px; left: 10px; font-size: 10px; color: #64748b;">HEAD</div>
            <div style="position: absolute; top: 5px; right: 10px; font-size: 10px; color: #64748b;">END</div>

            <!-- Memory Cells -->
            <div style="display: flex; height: 60px; margin: 0 20px; border: 1px solid #475569; position: relative;">
                <div style="flex: 1; border-right: 1px dashed #334155;"></div>
                <div style="flex: 1; border-right: 1px dashed #334155;"></div>
                <div style="flex: 1; background: rgba(56, 189, 248, 0.1); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-weight: bold; border: 1px solid #38bdf8;">PAYLOAD</div>
                <div style="flex: 1; border-left: 1px dashed #334155;"></div>
            </div>
            
            <!-- Pointer -->
            <div id="skb-ptr" style="position: absolute; top: 10px; left: 150px; width: 2px; height: 90px; background: #f43f5e; box-shadow: 0 0 8px #f43f5e; transition: left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;">
                <div style="position: absolute; top: -15px; left: -20px; background: #f43f5e; color: white; padding: 2px 4px; border-radius: 4px; font-size: 10px;">skb->data</div>
            </div>
        </div>
        <button class="btn" onclick="moveSkb()" style="margin-top: 20px;">Run: skb_push(header)</button>
    `;

    window.moveSkb = function () {
        const ptr = document.getElementById('skb-ptr');
        // Toggle position
        if (ptr.style.left === '150px') {
            ptr.style.left = '85px'; // Move Left (Reserve space)
        } else {
            ptr.style.left = '150px'; // Reset
        }
    }
}

// --- ANIMATION: TCP WINDOW (Refined) ---
function initTcpAnim(container) {
    container.innerHTML = `
        <div style="display: flex; gap: 8px; font-family: monospace; font-size: 14px; margin-bottom: 25px; position: relative; padding: 10px;">
            <div class="pkt" id="p1" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">1</div>
            <div class="pkt" id="p2" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">2</div>
            <div class="pkt" id="p3" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">3</div>
            <div class="pkt" id="p4" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">4</div>
            <div class="pkt" id="p5" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">5</div>
            <div class="pkt" id="p6" style="padding: 10px 14px; border: 1px solid #334155; border-radius: 4px; background: #1e293b;">6</div>
            
            <!-- Window Frame -->
            <div id="tcp-win" style="position: absolute; top: 0; left: 0; width: 135px; height: 60px; border: 2px solid #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); border-radius: 8px; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: none; transform: translateX(5px);">
                <div style="position: absolute; top: -20px; left: 0; color: #38bdf8; font-size: 10px; font-weight: bold;">WINDOW SIZE</div>
            </div>
        </div>
        <button class="btn" onclick="slideWindow()">Receive ACK -> Slide Window</button>
    `;

    let step = 0;
    const PKT_WIDTH = 45; // Approx width + gap

    window.slideWindow = function () {
        const win = document.getElementById('tcp-win');
        step++;
        if (step > 3) step = 0;

        win.style.transform = `translateX(${5 + (step * PKT_WIDTH)}px)`; // 5px offset

        // Highlight logic
        document.querySelectorAll('.pkt').forEach((el, i) => {
            el.style.transition = 'color 0.3s, border-color 0.3s';
            if (i < step) {
                el.style.color = '#10b981'; // Green (Acked)
                el.style.borderColor = '#10b981';
            } else if (i >= step && i < step + 3) {
                el.style.color = '#38bdf8'; // Blue (In Flight)
                el.style.borderColor = '#38bdf8';
            } else {
                el.style.color = '#475569'; // Grey
                el.style.borderColor = '#334155';
            }
        });
    }
}

// --- ANIMATION: EVENT LOOP (Refined) ---
function initLoopAnim(container) {
    container.innerHTML = `
        <div style="position: relative; width: 220px; height: 220px; margin: 0 auto;">
             <!-- Wheel -->
             <div id="ev-wheel" style="width: 100%; height: 100%; border: 6px solid #1e293b; border-top-color: #818cf8; border-bottom-color: #f43f5e; border-radius: 50%; box-shadow: 0 0 30px rgba(0,0,0,0.5); transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; background: #0f172a;">
                <div style="text-align: center; font-size: 10px; color: #94a3b8;">
                    <div style="color: #818cf8; margin-bottom: 5px;">MACRO<br>(setTimeout)</div>
                    <div style="width: 40px; height: 1px; background: #334155; margin: 5px auto;"></div>
                    <div style="color: #f43f5e; margin-top: 5px;">RENDER<br>(Paint)</div>
                </div>
             </div>
             
             <!-- Micro Queue (VIP) -->
             <div style="position: absolute; top: 40%; right: -120px; width: 100px;">
                <div style="font-size: 10px; color: #fbbf24; margin-bottom: 5px; font-weight: bold;">MICROTASK QUEUE</div>
                <div style="border: 1px solid #fbbf24; border-radius: 4px; padding: 2px; height: 10px; background: rgba(251, 191, 36, 0.1);">
                    <div id="micro-item" style="background: #fbbf24; height: 100%; width: 0%; box-shadow: 0 0 10px #fbbf24; transition: width 0.2s;"></div>
                </div>
                <div style="font-size: 9px; color: #64748b; margin-top: 5px;">Executes immediately!</div>
             </div>
        </div>
        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
            <button class="btn" onclick="spinWheel()">Next Tick</button>
        </div>
    `;

    let rotation = 0;
    window.spinWheel = function () {
        const wheel = document.getElementById('ev-wheel');
        const micro = document.getElementById('micro-item');

        rotation += 180; // Spin half circle
        wheel.style.transform = `rotate(${rotation}deg)`;

        // Flash microtasks
        setTimeout(() => {
            micro.style.width = '100%';
        }, 200);
        setTimeout(() => {
            micro.style.width = '0%';
        }, 800);
    }
}
