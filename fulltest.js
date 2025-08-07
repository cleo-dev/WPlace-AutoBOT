/* WPlace Unified Bot — Auto-Image + Auto-Farm
   - Modo: selecione "Auto-Image" ou "Auto-Farm" no topo do painel
   - Auto-Image: faça upload, (opcional) redimensione, selecione a posição pintando 1 px no site, e comece.
   - Auto-Farm: defina START_X/START_Y, área (pixels por lado) e delay. Ele pinta aleatório dentro da área.
*/
(async () => {
  // ========= CONFIG & TEXTS =========
  const CONFIG = {
    COOLDOWN_DEFAULT: 31000,
    TRANSPARENCY_THRESHOLD: 100,
    WHITE_THRESHOLD: 250,
    LOG_INTERVAL: 10,
    DELAY_DEFAULT: 1000,
    THEME: {
      primary: '#000000',
      secondary: '#111111',
      accent: '#222222',
      text: '#ffffff',
      highlight: '#775ce3',
      success: '#00ff00',
      error: '#ff0000',
      warning: '#ffaa00'
    }
  };

  const TEXTS = {
    pt: {
      appTitle: "WPlace Unified Bot",
      mode: "Modo",
      modeImage: "Auto-Image",
      modeFarm: "Auto-Farm",
      initBot: "Iniciar Auto-BOT",
      uploadImage: "Upload da Imagem",
      resizeImage: "Redimensionar Imagem",
      selectPosition: "Selecionar Posição",
      startPainting: "Iniciar Pintura",
      stopPainting: "Parar Pintura",
      checkingColors: "🔍 Verificando cores disponíveis...",
      noColorsFound: "❌ Abra a paleta de cores no site e tente novamente!",
      colorsFound: "✅ {count} cores disponíveis encontradas",
      loadingImage: "🖼️ Carregando imagem...",
      imageLoaded: "✅ Imagem carregada com {count} pixels válidos",
      imageError: "❌ Erro ao carregar imagem",
      selectPositionAlert: "Pinte o primeiro pixel na localização onde deseja que a arte comece!",
      waitingPosition: "👆 Aguardando você pintar o pixel de referência...",
      positionSet: "✅ Posição definida com sucesso!",
      positionTimeout: "❌ Tempo esgotado para selecionar posição",
      startPaintingMsg: "🎨 Iniciando pintura...",
      paintingProgress: "🧱 Progresso: {painted}/{total} pixels...",
      noCharges: "⌛ Sem cargas. Aguardando {time}...",
      paintingStopped: "⏹️ Pintura interrompida",
      paintingComplete: "✅ Pintura concluída! {count} pixels pintados.",
      paintingError: "❌ Erro durante a pintura",
      missingRequirements: "❌ Carregue uma imagem e selecione uma posição primeiro",
      progress: "Progresso",
      pixels: "Pixels",
      charges: "Cargas",
      estimatedTime: "Tempo estimado",
      initMessage: "Clique em 'Iniciar Auto-BOT' para começar",
      waitingInit: "Aguardando inicialização...",
      resizeSuccess: "✅ Imagem redimensionada para {width}x{height}",
      paintingPaused: "⏸️ Pintura pausada em X: {x}, Y: {y}",
      // Farm
      ready: "Pronto para começar",
      start: "Iniciar",
      stop: "Parar",
      user: "Usuário",
      level: "Level",
      farmSettings: "Configurações (Auto-Farm)",
      startX: "START_X",
      startY: "START_Y",
      area: "Lado da área (px)",
      delay: "Delay (ms)",
      apply: "Aplicar",
      cancel: "Cancelar",
      width: "Largura",
      height: "Altura",
      keepAspect: "Manter proporção"
    },
    en: {
      appTitle: "WPlace Unified Bot",
      mode: "Mode",
      modeImage: "Auto-Image",
      modeFarm: "Auto-Farm",
      initBot: "Start Auto-BOT",
      uploadImage: "Upload Image",
      resizeImage: "Resize Image",
      selectPosition: "Select Position",
      startPainting: "Start Painting",
      stopPainting: "Stop Painting",
      checkingColors: "🔍 Checking available colors...",
      noColorsFound: "❌ Open the color palette on the site and try again!",
      colorsFound: "✅ {count} available colors found",
      loadingImage: "🖼️ Loading image...",
      imageLoaded: "✅ Image loaded with {count} valid pixels",
      imageError: "❌ Error loading image",
      selectPositionAlert: "Paint the first pixel where you want the art to start!",
      waitingPosition: "👆 Waiting for the reference pixel...",
      positionSet: "✅ Position set!",
      positionTimeout: "❌ Timeout selecting position",
      startPaintingMsg: "🎨 Starting...",
      paintingProgress: "🧱 Progress: {painted}/{total} pixels...",
      noCharges: "⌛ No charges. Waiting {time}...",
      paintingStopped: "⏹️ Painting stopped",
      paintingComplete: "✅ Complete! {count} pixels painted.",
      paintingError: "❌ Error during painting",
      missingRequirements: "❌ Load an image and select a position first",
      progress: "Progress",
      pixels: "Pixels",
      charges: "Charges",
      estimatedTime: "Estimated time",
      initMessage: "Click 'Start Auto-BOT' to begin",
      waitingInit: "Waiting for initialization...",
      resizeSuccess: "✅ Image resized to {width}x{height}",
      paintingPaused: "⏸️ Painting paused at X: {x}, Y: {y}",
      // Farm
      ready: "Ready to start",
      start: "Start",
      stop: "Stop",
      user: "User",
      level: "Level",
      farmSettings: "Settings (Auto-Farm)",
      startX: "START_X",
      startY: "START_Y",
      area: "Area side (px)",
      delay: "Delay (ms)",
      apply: "Apply",
      cancel: "Cancel",
      width: "Width",
      height: "Height",
      keepAspect: "Keep aspect"
    }
  };

  // ========= STATE =========
  const state = {
    language: 'en',
    minimized: false,
    running: false,
    // common
    availableColors: [],
    colorsChecked: false,
    currentCharges: 0,
    cooldown: CONFIG.COOLDOWN_DEFAULT,
    // image mode
    imageLoaded: false,
    imageData: null,
    totalPixels: 0,
    paintedPixels: 0,
    stopFlag: false,
    startPosition: null,
    selectingPosition: false,
    region: null,
    lastPosition: { x: 0, y: 0 },
    estimatedTime: 0,
    // farm mode
    userInfo: null,
    farmPainted: 0,
    farmCharges: { count: 0, max: 80, cooldownMs: 30000 },
    farmOpts: { START_X: 742, START_Y: 1148, AREA: 100, DELAY: CONFIG.DELAY_DEFAULT },
    mode: 'image' // 'image' | 'farm'
  };

  // ========= UTILS & SERVICES =========
  async function detectLanguage() {
    try {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      state.language = d.country === 'BR' ? 'pt' : 'en';
    } catch { state.language = 'en'; }
  }
  const t = (key, params = {}) => {
    let text = (TEXTS[state.language] || TEXTS.en)[key] || (TEXTS.en[key] || key);
    for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
    return text;
  };
  const Utils = {
    sleep: ms => new Promise(r => setTimeout(r, ms)),
    colorDistance: (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]),
    createImageUploader: () => new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/png,image/jpeg';
      input.onchange = () => { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.readAsDataURL(input.files[0]); };
      input.click();
    }),
    extractAvailableColors: () => {
      const els = document.querySelectorAll('[id^="color-"]');
      return Array.from(els)
        .filter(el => !el.querySelector('svg'))
        .filter(el => { const id = +el.id.replace('color-',''); return id !== 0 && id !== 5; })
        .map(el => {
          const id = +el.id.replace('color-','');
          const rgbStr = el.style.backgroundColor.match(/\d+/g);
          const rgb = rgbStr ? rgbStr.map(Number) : [0,0,0];
          return { id, rgb };
        });
    },
    formatTime: ms => {
      const s = Math.floor((ms/1000)%60), m = Math.floor((ms/60000)%60),
            h = Math.floor((ms/3600000)%24), d = Math.floor(ms/86400000);
      return `${d?d+'d ':''}${(h||d)?h+'h ':''}${(m||h||d)?m+'m ':''}${s}s`;
    },
    isWhite: (r,g,b) => r>=CONFIG.WHITE_THRESHOLD && g>=CONFIG.WHITE_THRESHOLD && b>=CONFIG.WHITE_THRESHOLD,
  };
  const WPlaceService = {
    async post(url, options) {
      try { const r = await fetch(url, { credentials: 'include', ...options }); return await r.json(); }
      catch { return null; }
    },
    async paintPixelInRegion(regionX, regionY, pixelX, pixelY, color) {
      const data = await this.post(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ coords: [pixelX, pixelY], colors: [color] })
      });
      return data?.painted === 1;
    },
    async me() {
      const data = await this.post('https://backend.wplace.live/me');
      if (!data) return { charges: { count:0, cooldownMs: CONFIG.COOLDOWN_DEFAULT, max:0 }, name:'', level:0 };
      return data;
    }
  };

  class ImageProcessor {
    constructor(src){ this.img = new Image(); this.img.src = src;
      this.canvas = document.createElement('canvas'); this.ctx = this.canvas.getContext('2d');
      this.preview = document.createElement('canvas'); this.pctx = this.preview.getContext('2d');
    }
    load(){ return new Promise((res,rej)=>{ this.img.onload=()=>{ this.canvas.width=this.img.width; this.canvas.height=this.img.height; this.ctx.drawImage(this.img,0,0); res(); }; this.img.onerror=rej; }); }
    dims(){ return { width:this.canvas.width, height:this.canvas.height }; }
    pixels(){ return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height).data; }
    resize(w,h){ const c=document.createElement('canvas'),x=c.getContext('2d'); c.width=w;c.height=h; x.drawImage(this.img,0,0,w,h); this.canvas.width=w;this.canvas.height=h; this.ctx.drawImage(c,0,0); return this.pixels(); }
    previewData(w,h){ this.preview.width=w; this.preview.height=h; this.pctx.imageSmoothingEnabled=false; this.pctx.drawImage(this.img,0,0,w,h); return this.preview.toDataURL(); }
  }
  const findClosestColor = (rgb, palette) =>
    palette.reduce((best, cur) => {
      const d = Utils.colorDistance(rgb, cur.rgb);
      return d < best.dist ? { id: cur.id, dist: d } : best;
    }, { id: palette[0]?.id ?? 1, dist: Infinity }).id;

  // ========= UI =========
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,255,0,.7)}70%{box-shadow:0 0 0 10px rgba(0,255,0,0)}100%{box-shadow:0 0 0 0 rgba(0,255,0,0)}}
      @keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
      #wplace-unified{position:fixed;top:20px;right:20px;width:320px;background:${CONFIG.THEME.primary};border:1px solid ${CONFIG.THEME.accent};border-radius:8px;overflow:hidden;z-index:9998;color:${CONFIG.THEME.text};font-family:'Segoe UI',Roboto,sans-serif;box-shadow:0 5px 15px rgba(0,0,0,.5);animation:slideIn .4s}
      .hdr{background:${CONFIG.THEME.secondary};padding:12px 15px;display:flex;justify-content:space-between;align-items:center;color:${CONFIG.THEME.highlight};font-weight:600}
      .content{padding:14px;display:block}
      .row{display:flex;gap:8px;margin-bottom:8px}
      .btn{flex:1;padding:10px;border:none;border-radius:6px;font-weight:600;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;transition:transform .2s}
      .btn:hover{transform:translateY(-2px)}
      .primary{background:${CONFIG.THEME.accent};color:#fff}
      .success{background:${CONFIG.THEME.success};color:#000}
      .danger{background:${CONFIG.THEME.error};color:#fff}
      .warn{background:${CONFIG.THEME.highlight};color:#000}
      .muted{background:${CONFIG.THEME.secondary};color:#fff;border:1px dashed #777}
      .progress{height:10px;background:${CONFIG.THEME.secondary};border-radius:4px;overflow:hidden;margin:8px 0}
      .bar{height:10px;background:${CONFIG.THEME.highlight};width:0}
      .stats{background:${CONFIG.THEME.secondary};padding:10px;border-radius:6px;margin:8px 0;font-size:13px}
      .stat{display:flex;justify-content:space-between;padding:4px 0}
      .status{padding:8px;border-radius:4px;text-align:center;font-size:13px}
      .s-default{background:rgba(255,255,255,.1)}
      .s-ok{background:rgba(0,255,0,.1);color:${CONFIG.THEME.success}}
      .s-err{background:rgba(255,0,0,.1);color:${CONFIG.THEME.error}}
      .s-warn{background:rgba(255,165,0,.1);color:#ffa500}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
      .label{font-size:12px;opacity:.85}
      .input{width:100%;padding:6px;border-radius:4px;border:1px solid #333;background:#0b0b0b;color:#fff}
      .select{width:100%;padding:6px;border-radius:4px;border:1px solid #333;background:#0b0b0b;color:#fff}
      .note{font-size:12px;opacity:.8}
      .minimized .content{display:none}
      #paintEffect{position:absolute;inset:0;pointer-events:none}
      .resize-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;z-index:9999}
      .resize-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:${CONFIG.THEME.primary};padding:16px;border-radius:8px;z-index:10000;width:min(90vw,420px)}
      .resize-preview{max-width:100%;max-height:260px;border:1px solid ${CONFIG.THEME.accent};margin:10px 0}
    `;
    document.head.appendChild(style);
    const fa = document.createElement('link'); fa.rel='stylesheet';
    fa.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  function buildUI() {
    const box = document.createElement('div'); box.id='wplace-unified';
    box.innerHTML = `
      <div id="paintEffect"></div>
      <div class="hdr">
        <div><i class="fas fa-cubes"></i> ${t('appTitle')}</div>
        <div><button id="minBtn" class="btn muted" style="padding:6px 10px"><i class="fas fa-minus"></i></button></div>
      </div>
      <div class="content">
        <div class="row">
          <label class="label" style="flex:1">
            ${t('mode')}
            <select id="modeSel" class="select">
              <option value="image">${t('modeImage')}</option>
              <option value="farm">${t('modeFarm')}</option>
            </select>
          </label>
        </div>

        <!-- Auto-Image controls -->
        <div id="imageBlock">
          <div class="row">
            <button id="initBtn" class="btn primary"><i class="fas fa-robot"></i>${t('initBot')}</button>
          </div>
          <div class="row">
            <button id="uploadBtn" class="btn muted" disabled><i class="fas fa-upload"></i>${t('uploadImage')}</button>
            <button id="resizeBtn" class="btn primary" disabled><i class="fas fa-expand"></i>${t('resizeImage')}</button>
          </div>
          <div class="row">
            <button id="selPosBtn" class="btn warn" disabled><i class="fas fa-crosshairs"></i>${t('selectPosition')}</button>
          </div>
          <div class="row">
            <button id="startImgBtn" class="btn success" disabled><i class="fas fa-play"></i>${t('startPainting')}</button>
            <button id="stopImgBtn" class="btn danger" disabled><i class="fas fa-stop"></i>${t('stopPainting')}</button>
          </div>
          <div class="progress"><div id="bar" class="bar"></div></div>
        </div>

        <!-- Auto-Farm controls -->
        <div id="farmBlock" style="display:none">
          <div class="stats"><b>${t('farmSettings')}</b>
            <div class="grid" style="margin-top:6px">
              <label class="label">${t('startX')}<input id="fx" type="number" class="input" value="742"/></label>
              <label class="label">${t('startY')}<input id="fy" type="number" class="input" value="1148"/></label>
              <label class="label">${t('area')}<input id="farea" type="number" class="input" value="100"/></label>
              <label class="label">${t('delay')}<input id="fdelay" type="number" class="input" value="${CONFIG.DELAY_DEFAULT}"/></label>
            </div>
            <div class="row" style="margin-top:6px">
              <button id="applyFarm" class="btn primary"><i class="fas fa-check"></i>${t('apply')}</button>
            </div>
          </div>
          <div class="row">
            <button id="toggleFarm" class="btn primary"><i class="fas fa-play"></i>${t('start')}</button>
          </div>
        </div>

        <div class="stats" id="stats"></div>
        <div id="status" class="status s-default">${t('waitingInit')}</div>
      </div>
    `;
    document.body.appendChild(box);

    // draggable
    const hdr = box.querySelector('.hdr'); let p1=0,p2=0,p3=0,p4=0;
    hdr.onmousedown = e => {
      if (e.target.closest('#minBtn')) return;
      e.preventDefault(); p3=e.clientX; p4=e.clientY;
      document.onmouseup = ()=>{document.onmousemove=null; document.onmouseup=null;};
      document.onmousemove = ev => { ev.preventDefault(); p1=p3-ev.clientX; p2=p4-ev.clientY; p3=ev.clientX; p4=ev.clientY;
        box.style.top = (box.offsetTop - p2) + "px"; box.style.left = (box.offsetLeft - p1) + "px";
      };
    };

    // events
    box.querySelector('#minBtn').onclick = ()=>{
      state.minimized = !state.minimized; box.classList.toggle('minimized', state.minimized);
      box.querySelector('#minBtn').innerHTML = `<i class="fas fa-${state.minimized?'expand':'minus'}"></i>`;
    };
    const modeSel = box.querySelector('#modeSel');
    modeSel.value = state.mode;
    modeSel.onchange = ()=> {
      state.mode = modeSel.value;
      box.querySelector('#imageBlock').style.display = state.mode==='image'?'block':'none';
      box.querySelector('#farmBlock').style.display  = state.mode==='farm'?'block':'none';
      updateStatus(t('ready'), 'default');
      updateStats();
    };

    // image controls
    const initBtn = box.querySelector('#initBtn');
    const uploadBtn = box.querySelector('#uploadBtn');
    const resizeBtn = box.querySelector('#resizeBtn');
    const selPosBtn = box.querySelector('#selPosBtn');
    const startImgBtn = box.querySelector('#startImgBtn');
    const stopImgBtn = box.querySelector('#stopImgBtn');

    initBtn.onclick = async () => {
      updateStatus('checkingColors','default');
      state.availableColors = Utils.extractAvailableColors();
      if (!state.availableColors.length) {
        updateStatus('noColorsFound','err'); alert(t('noColorsFound')); return;
      }
      state.colorsChecked = true;
      uploadBtn.disabled = false; selPosBtn.disabled = false; initBtn.style.display='none';
      updateStatus('colorsFound','ok',{ count: state.availableColors.length });
      updateStats();
    };

    uploadBtn.onclick = async () => {
      try {
        updateStatus('loadingImage');
        const src = await Utils.createImageUploader();
        const proc = new ImageProcessor(src);
        await proc.load();
        const { width, height } = proc.dims();
        const pixels = proc.pixels();
        let valid=0;
        for (let y=0;y<height;y++) for (let x=0;x<width;x++){
          const i=(y*width+x)*4, r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
          if (a<CONFIG.TRANSPARENCY_THRESHOLD) continue;
          if (Utils.isWhite(r,g,b)) continue;
          valid++;
        }
        state.imageData = { width, height, pixels, processor: proc };
        state.totalPixels = valid; state.paintedPixels = 0; state.imageLoaded = true; state.lastPosition={x:0,y:0};
        resizeBtn.disabled=false; if (state.startPosition) startImgBtn.disabled=false;
        updateStats(); updateStatus('imageLoaded','ok',{ count: valid });
      } catch { updateStatus('imageError','err'); }
    };

    // Resize modal
    const overlay = document.createElement('div'); overlay.className='resize-overlay'; document.body.appendChild(overlay);
    const modal = document.createElement('div'); modal.className='resize-modal'; modal.style.display='none'; document.body.appendChild(modal);
    const openResize = () => {
      const proc = state.imageData?.processor; if (!proc) return;
      const { width, height } = proc.dims(); const ratio = width/height;
      modal.innerHTML = `
        <div style="font-weight:600;margin-bottom:6px">${t('resizeImage')}</div>
        <div class="grid">
          <label class="label">${t('width')}<input id="rw" type="number" class="input" value="${width}"></label>
          <label class="label">${t('height')}<input id="rh" type="number" class="input" value="${height}"></label>
        </div>
        <label class="label" style="display:flex;align-items:center;gap:6px;margin-top:6px">
          <input id="keep" type="checkbox" checked>${t('keepAspect')}
        </label>
        <img id="rprev" class="resize-preview" />
        <div class="row"><button id="rapply" class="btn primary"><i class="fas fa-check"></i>${t('apply')}</button>
                        <button id="rcancel" class="btn danger"><i class="fas fa-times"></i>${t('cancel')}</button></div>`;
      const rw = modal.querySelector('#rw'), rh = modal.querySelector('#rh'),
            keep = modal.querySelector('#keep'), rprev = modal.querySelector('#rprev');
      const upd = ()=> rprev.src = proc.previewData(+rw.value, +rh.value);
      rw.oninput = ()=>{ if (keep.checked) rh.value = Math.max(1, Math.round(+rw.value/ratio)); upd(); };
      rh.oninput = ()=>{ if (keep.checked) rw.value = Math.max(1, Math.round(+rh.value*ratio)); upd(); };
      upd();
      modal.querySelector('#rapply').onclick = ()=>{
        const nw=+rw.value, nh=+rh.value; const px = proc.resize(nw,nh);
        let valid=0; for (let y=0;y<nh;y++) for (let x=0;x<nw;x++){ const i=(y*nw+x)*4, r=px[i],g=px[i+1],b=px[i+2],a=px[i+3]; if (a<CONFIG.TRANSPARENCY_THRESHOLD) continue; if (Utils.isWhite(r,g,b)) continue; valid++; }
        state.imageData.width=nw; state.imageData.height=nh; state.imageData.pixels=px;
        state.totalPixels=valid; state.paintedPixels=0; updateStats(); updateStatus('resizeSuccess','ok',{width:nw,height:nh});
        overlay.style.display='none'; modal.style.display='none';
      };
      modal.querySelector('#rcancel').onclick = ()=>{ overlay.style.display='none'; modal.style.display='none'; };
      overlay.style.display='block'; modal.style.display='block';
    };
    resizeBtn.onclick = ()=> state.imageLoaded && openResize();

    selPosBtn.onclick = async () => {
      if (state.selectingPosition) return;
      state.selectingPosition = true; state.startPosition=null; state.region=null; startImgBtn.disabled=true;
      alert(t('selectPositionAlert')); updateStatus('waitingPosition','default');
      const originalFetch = window.fetch;
      window.fetch = async (url, options) => {
        if (typeof url==='string' && url.includes('/s0/pixel/') && options?.method?.toUpperCase()==='POST'){
          try{
            const resp = await originalFetch(url, options); const clone = resp.clone(); const data = await clone.json();
            if (data?.painted===1){
              const m = url.match(/\/pixel\/(\d+)\/(\d+)/); if (m){ state.region={x:+m[1], y:+m[2]}; }
              const body = JSON.parse(options.body||'{}'); if (body?.coords){ state.startPosition={x:body.coords[0], y:body.coords[1]}; state.lastPosition={x:0,y:0};
                if (state.imageLoaded) startImgBtn.disabled=false;
                window.fetch = originalFetch; state.selectingPosition=false; updateStatus('positionSet','ok');
              }
            }
            return resp;
          }catch{ return originalFetch(url,options); }
        }
        return originalFetch(url, options);
      };
      setTimeout(()=>{ if (state.selectingPosition){ window.fetch = originalFetch; state.selectingPosition=false; updateStatus('positionTimeout','err'); alert(t('positionTimeout')); }}, 120000);
    };

    startImgBtn.onclick = async () => {
      if (!state.imageLoaded || !state.startPosition || !state.region){ updateStatus('missingRequirements','err'); return; }
      state.running = true; state.stopFlag=false;
      startImgBtn.disabled=true; stopImgBtn.disabled=false; uploadBtn.disabled=true; selPosBtn.disabled=true; resizeBtn.disabled=true;
      updateStatus('startPaintingMsg','ok');
      try{ await processImageMode(); } catch{ updateStatus('paintingError','err'); }
      finally{
        state.running=false; stopImgBtn.disabled=true; uploadBtn.disabled=false; selPosBtn.disabled=false; resizeBtn.disabled=false;
        if (!state.stopFlag){ startImgBtn.disabled=true; } else { startImgBtn.disabled=false; }
      }
    };
    stopImgBtn.onclick = ()=>{ state.stopFlag=true; state.running=false; stopImgBtn.disabled=true; updateStatus('paintingStopped','warn'); };

    // farm controls
    const toggleFarm = box.querySelector('#toggleFarm');
    const applyFarm = box.querySelector('#applyFarm');
    const fx = box.querySelector('#fx'), fy = box.querySelector('#fy'), farea = box.querySelector('#farea'), fdelay = box.querySelector('#fdelay');

    applyFarm.onclick = ()=>{
      state.farmOpts.START_X = +fx.value||0;
      state.farmOpts.START_Y = +fy.value||0;
      state.farmOpts.AREA    = Math.max(1, +farea.value||50);
      state.farmOpts.DELAY   = Math.max(0, +fdelay.value||CONFIG.DELAY_DEFAULT);
      updateStatus('apply','ok');
    };

    toggleFarm.onclick = async ()=>{
      state.running = !state.running;
      if (state.running){
        toggleFarm.classList.remove('primary'); toggleFarm.classList.add('danger'); toggleFarm.innerHTML=`<i class="fas fa-stop"></i>${t('stop')}`;
        updateStatus('startPaintingMsg','ok'); farmLoop();
      } else {
        toggleFarm.classList.add('primary'); toggleFarm.classList.remove('danger'); toggleFarm.innerHTML=`<i class="fas fa-play"></i>${t('start')}`;
        updateStatus('paintingPaused','default',{x:'-',y:'-'});
      }
    };

    // status & stats
    window.updateStatus = (key, kind='default', params={})=>{
      const el = document.querySelector('#status'); const msg = t(key, params);
      el.textContent = msg; el.className = `status s-${kind==='ok'?'ok':kind==='err'?'err':kind==='warn'?'warn':'default'}`;
      el.style.animation='none'; void el.offsetWidth; el.style.animation='slideIn .3s ease-out';
    };

    window.updateStats = async () => {
      // charges
      const me = await WPlaceService.me();
      const charges = me?.charges || { count:0, cooldownMs:CONFIG.COOLDOWN_DEFAULT, max:0 };
      state.currentCharges = Math.floor(charges.count);
      state.cooldown = charges.cooldownMs;
      state.farmCharges = { count: Math.floor(charges.count), max: Math.floor(charges.max||0), cooldownMs: charges.cooldownMs };
      state.userInfo = me;
      // image progress
      const progress = state.totalPixels ? Math.round((state.paintedPixels/state.totalPixels)*100) : 0;
      document.querySelector('#bar').style.width = `${progress}%`;
      const s = document.querySelector('#stats');
      s.innerHTML = `
        <div class="stat"><span>${t('progress')}</span><span>${state.totalPixels?Math.round((state.paintedPixels/state.totalPixels)*100):0}%</span></div>
        <div class="stat"><span>${t('pixels')}</span><span>${state.paintedPixels||0}/${state.totalPixels||0} (${state.mode==='farm'?state.farmPainted:state.paintedPixels})</span></div>
        <div class="stat"><span>${t('charges')}</span><span>${Math.floor(state.currentCharges)}/${Math.floor(state.farmCharges.max||0)}</span></div>
        ${state.mode==='image' && state.totalPixels ? `<div class="stat"><span>${t('estimatedTime')}</span><span>${Utils.formatTime(state.estimatedTime||0)}</span></div>`:''}
        ${state.userInfo?.name?`<div class="stat"><span>${t('user')}</span><span>${state.userInfo.name}</span></div>`:''}
        ${Number.isFinite(+state.userInfo?.level)?`<div class="stat"><span>${t('level')}</span><span>${Math.floor(state.userInfo.level||0)}</span></div>`:''}
      `;
    };
  }

  // ========= MODES =========
  async function ensureCharges() {
    if (state.currentCharges < 1) {
      updateStatus('noCharges','warn',{ time: Utils.formatTime(state.cooldown) });
      await Utils.sleep(state.cooldown);
      const me = await WPlaceService.me();
      state.currentCharges = Math.floor(me?.charges?.count || 0);
      state.cooldown = me?.charges?.cooldownMs || CONFIG.COOLDOWN_DEFAULT;
      return state.currentCharges > 0;
    }
    return true;
  }

  async function processImageMode() {
    const { width, height, pixels } = state.imageData;
    const { x: startX, y: startY } = state.startPosition;
    const { x: regionX, y: regionY } = state.region;
    let startRow = state.lastPosition.y || 0;
    let startCol = state.lastPosition.x || 0;

    outer:
    for (let y = startRow; y < height; y++) {
      for (let x = (y===startRow?startCol:0); x < width; x++) {
        if (state.stopFlag){ state.lastPosition={x,y}; updateStatus('paintingPaused','warn',{x,y}); break outer; }
        const i=(y*width+x)*4, r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
        if (a<CONFIG.TRANSPARENCY_THRESHOLD) continue;
        if (Utils.isWhite(r,g,b)) continue;

        if (!(await ensureCharges())) continue;

        const colorId = findClosestColor([r,g,b], state.availableColors);
        const ok = await WPlaceService.paintPixelInRegion(regionX, regionY, startX+x, startY+y, colorId);
        if (ok){
          state.paintedPixels++; state.currentCharges--;
          state.estimatedTime = (state.totalPixels-state.paintedPixels) * 100 + state.cooldown; // estimativa simples
          if (state.paintedPixels % CONFIG.LOG_INTERVAL === 0){
            updateStats(); updateStatus('paintingProgress','default',{ painted:state.paintedPixels, total:state.totalPixels });
          }
          const eff = document.getElementById('paintEffect'); if (eff){ eff.style.animation='pulse .5s'; setTimeout(()=>eff.style.animation='',500); }
        }
      }
    }
    if (state.stopFlag){ updateStatus('paintingStopped','warn'); }
    else { updateStatus('paintingComplete','ok',{ count: state.paintedPixels }); state.lastPosition={x:0,y:0}; }
    updateStats();
  }

  function randInt(n){ return Math.floor(Math.random()*n); }
  async function farmLoop() {
    while (state.running && state.mode==='farm') {
      await updateStats();
      if (state.farmCharges.count < 1){
        updateStatus('noCharges','warn',{ time: Utils.formatTime(state.farmCharges.cooldownMs) });
        await Utils.sleep(state.farmCharges.cooldownMs);
        const me = await WPlaceService.me();
        state.farmCharges.count = Math.floor(me?.charges?.count || 0);
        state.farmCharges.max   = Math.floor(me?.charges?.max || 0);
        state.farmCharges.cooldownMs = me?.charges?.cooldownMs || CONFIG.COOLDOWN_DEFAULT;
        continue;
      }
      // pick random pos inside area
      const x = randInt(state.farmOpts.AREA), y = randInt(state.farmOpts.AREA);
      const color = Math.floor(Math.random()*31)+1;
      const ok = await WPlaceService.paintPixelInRegion(
        state.farmOpts.START_X, state.farmOpts.START_Y,
        state.farmOpts.START_X + x, state.farmOpts.START_Y + y, color
      );
      if (ok){
        state.farmPainted++; state.farmCharges.count--;
        const eff = document.getElementById('paintEffect'); if (eff){ eff.style.animation='pulse .5s'; setTimeout(()=>eff.style.animation='',500); }
        updateStatus(state.language==='pt'?'✅ Pixel pintado!':'✅ Pixel painted!','ok');
      } else {
        updateStatus(state.language==='pt'?'❌ Falha ao pintar':'❌ Failed to paint','err');
      }
      await Utils.sleep(state.farmOpts.DELAY);
    }
  }

  // ========= BOOT =========
  await detectLanguage();
  injectStyles();
  buildUI();
  updateStatus('waitingInit','default');
  await (async()=>{ const me = await WPlaceService.me(); state.currentCharges = Math.floor(me?.charges?.count || 0); state.cooldown = me?.charges?.cooldownMs || CONFIG.COOLDOWN_DEFAULT; })();
  updateStats();
})();
</script>
