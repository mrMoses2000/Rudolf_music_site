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
        tertiaryColor: '#111827',
        // Sequence Diagram Specifics
        actorBkg: '#1e293b',
        actorBorder: '#818cf8',
        actorTextColor: '#f8fafc',
        signalColor: '#f8fafc',
        signalTextColor: '#f8fafc',
        labelBoxBkgColor: '#1e293b',
        labelBoxBorderColor: '#818cf8',
        labelTextColor: '#f8fafc',
        loopTextColor: '#f8fafc',
        noteBkgColor: '#1e293b',
        noteTextColor: '#f8fafc',
        noteBorderColor: '#334155'
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

    // --- New Animations ---
    const nsContainer = document.getElementById('anim-ns');
    if (nsContainer) initNsAnim(nsContainer);

    const bridgeContainer = document.getElementById('anim-bridge');
    if (bridgeContainer) initBridgeAnim(bridgeContainer);

    const dnsContainer = document.getElementById('anim-dns');
    if (dnsContainer) initDnsAnim(dnsContainer);

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
// --- NEW ANIMATION: NAMESPACES (PID MAPPING) ---
function initNsAnim(container) {
    container.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: center; justify-content: center;">
            <!-- Host Space -->
            <div style="border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; width: 140px; background: rgba(59, 130, 246, 0.1);">
                <div style="color: #60a5fa; font-size: 10px; margin-bottom: 10px; font-weight: bold;">HOST NS (Init)</div>
                <div id="host-pids" style="display: flex; flex-direction: column; gap: 5px;">
                    <div class="pid-box" style="background:#1e3a8a; padding:5px; font-size:10px; border-radius:4px;">PID: 1 (systemd)</div>
                    <div class="pid-box" style="background:#1e3a8a; padding:5px; font-size:10px; border-radius:4px;">PID: 450 (sshd)</div>
                </div>
            </div>

            <div style="font-size: 20px; color: #64748b;">➝</div>

            <!-- Container Space -->
            <div style="border: 2px solid #d97706; padding: 20px; border-radius: 8px; width: 140px; background: rgba(217, 119, 6, 0.1);">
                <div style="color: #fbbf24; font-size: 10px; margin-bottom: 10px; font-weight: bold;">NEW NS (Container)</div>
                <div id="container-pids" style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="color: #9ca3af; font-size: 10px; font-style: italic;">Empty...</div>
                </div>
            </div>
        </div>
        <button class="btn" onclick="spawnContainer()" style="margin-top: 20px;">sys_clone(CLONE_NEWPID)</button>
    `;

    window.spawnContainer = function () {
        const hostDiv = document.getElementById('host-pids');
        const contDiv = document.getElementById('container-pids');

        // Add to Host
        const hostPid = document.createElement('div');
        hostPid.className = 'pid-box';
        hostPid.style.cssText = "background:#1e3a8a; padding:5px; font-size:10px; border-radius:4px; opacity:0; transform: translateY(10px); border: 1px solid #d97706;";
        hostPid.innerText = "PID: 8890 (bash)";
        hostDiv.appendChild(hostPid);

        // Add to Container
        const contPid = document.createElement('div');
        contPid.className = 'pid-box';
        contPid.style.cssText = "background:#78350f; padding:5px; font-size:10px; border-radius:4px; opacity:0; transform: translateY(10px); border: 1px solid #fbbf24;";
        contPid.innerText = "PID: 1 (bash)";
        contDiv.innerHTML = ''; // clear empty msg
        contDiv.appendChild(contPid);

        // Animate in
        requestAnimationFrame(() => {
            hostPid.style.opacity = '1';
            hostPid.style.transform = 'translateY(0)';
            contPid.style.opacity = '1';
            contPid.style.transform = 'translateY(0)';
        });
    }
}

// --- NEW ANIMATION: BRIDGE (MAC LEARNING) ---
function initBridgeAnim(container) {
    container.innerHTML = `
        <div style="display: flex; gap: 40px; justify-content: center; align-items: flex-start;">
            <!-- Ports -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button class="btn" style="font-size: 10px; padding: 8px;" onclick="pktIn('A', 1)">Pkt from MAC:A (Port 1)</button>
                <button class="btn" style="font-size: 10px; padding: 8px;" onclick="pktIn('B', 2)">Pkt from MAC:B (Port 2)</button>
                <button class="btn" style="font-size: 10px; padding: 8px;" onclick="pktIn('C', 1)">Pkt from MAC:C (Port 1)</button>
            </div>

            <!-- FDB Table -->
            <div style="width: 200px; border: 1px solid #334155; background: #0f172a; border-radius: 4px; padding: 10px;">
                <div style="font-size: 10px; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-bottom: 5px; display:flex; justify-content:space-between;">
                    <span>MAC ADDRESS</span>
                    <span>PORT</span>
                </div>
                <div id="fdb-rows" style="font-family: monospace; font-size: 11px; color: #e2e8f0; display: flex; flex-direction: column; gap: 2px;">
                    <div style="color: #475569; font-style: italic;">Table Empty</div>
                </div>
            </div>
        </div>
    `;

    const fdb = {}; // State

    window.pktIn = function (mac, port) {
        // Logic
        fdb[mac] = { port: port, ts: Date.now() };
        renderFDB();
    }

    function renderFDB() {
        const rows = document.getElementById('fdb-rows');
        rows.innerHTML = '';
        Object.keys(fdb).forEach(mac => {
            const row = document.createElement('div');
            row.className = 'cam-row active';
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.padding = '2px 4px';
            row.innerHTML = `<span>MAC:${mac}</span><span style="color:#38bdf8">Port ${fdb[mac].port}</span>`;
            rows.appendChild(row);

            // Remove highlight
            setTimeout(() => row.classList.remove('active'), 500);
        });
    }
}

// --- NEW ANIMATION: DNS (RECURSIVE TRACE) ---
function initDnsAnim(container) {
    container.innerHTML = `
        <div style="position: relative; height: 260px; width: 100%; overflow: hidden;">
            <!-- Client (Left) -->
            <div id="d-client" class="trace-node" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); border: 1px solid #334155; padding: 8px 12px; border-radius: 6px; font-size: 11px; z-index: 10;">Client</div>
            
            <!-- Resolver (Center-Left Hub) -->
            <div id="d-res" class="trace-node" style="position: absolute; top: 50%; left: 35%; transform: translate(-50%, -50%); border: 2px solid #10b981; padding: 15px; border-radius: 50%; width: 60px; height: 60px; display:flex; align-items:center; justify-content:center; font-size: 10px; font-weight:bold; color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); z-index: 10; background: #0f172a;">8.8.8.8</div>

            <!-- Authorities Stack (Right) -->
            <div id="d-root" class="trace-node" style="position: absolute; top: 20px; right: 10px; border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; font-size: 10px; width: 120px; text-align: center;">ROOT (.)</div>
            
            <div id="d-com" class="trace-node" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; font-size: 10px; width: 120px; text-align: center;">TLD (.com)</div>
            
            <div id="d-auth" class="trace-node" style="position: absolute; bottom: 20px; right: 10px; border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; font-size: 10px; width: 120px; text-align: center;">AUTH (ns1)</div>
            
            <!-- Connection Lines (SVG) -->
            <svg style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1; pointer-events: none;">
                <line x1="60" y1="130" x2="35%" y2="130" stroke="#334155" stroke-dasharray="4"/>
                <line x1="35%" y1="130" x2="90%" y2="35" stroke="#334155" stroke-dasharray="4"/>
                <line x1="35%" y1="130" x2="90%" y2="130" stroke="#334155" stroke-dasharray="4"/>
                <line x1="35%" y1="130" x2="90%" y2="225" stroke="#334155" stroke-dasharray="4"/>
            </svg>
        </div>
        <button class="btn" onclick="startTrace()">Trace: google.com</button>
    `;

    window.startTrace = async function () {
        const reset = () => document.querySelectorAll('.trace-node').forEach(el => el.classList.remove('active'));
        const active = (id) => document.getElementById(id).classList.add('active');
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        reset();
        await sleep(100);

        // 1. Client -> Recursive
        active('d-client');
        active('d-res');
        await sleep(600);

        // 2. Recursive -> Root
        active('d-root');
        await sleep(600);

        // 3. Recursive -> TLD
        active('d-com');
        await sleep(600);

        // 4. Recursive -> Auth
        active('d-auth');
        await sleep(600);

        // 5. Back
        reset();
        active('d-client');
        document.getElementById('d-client').innerText = "Client (IP Found!)";
    }
}
