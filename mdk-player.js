class MdkPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // --- التحديث الجديد: الرابط الأساسي (Base URL) ---
        const baseUrl = 'https://moddaker.fra1.cdn.digitaloceanspaces.com/';
        
        // جلب الجزء الذي وضعته في الـ HTML
        const rawSrc = this.getAttribute('src') || '';
        
        // بناء الرابط النهائي الذكي
        let fullAudioSrc = '';
        if (rawSrc) {
            // إذا كان الرابط يبدأ بـ http (رابط كامل)، استخدمه كما هو
            if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
                fullAudioSrc = rawSrc;
            } else {
                // التأكد من عدم وجود شرطة مزدوجة (//) عند دمج الرابطين
                const cleanRawSrc = rawSrc.startsWith('/') ? rawSrc.substring(1) : rawSrc;
                fullAudioSrc = baseUrl + cleanRawSrc;
            }
        }
        
        // استخراج اسم الملف بدقة للعنوان
        let defaultTitle = 'مقطع صوتي';
        if (rawSrc) {
            try {
                const cleanUrl = rawSrc.split('?')[0];
                const fileNameWithExt = cleanUrl.split('/').pop();
                const lastDotIndex = fileNameWithExt.lastIndexOf('.');
                const nameOnly = lastDotIndex !== -1 ? fileNameWithExt.substring(0, lastDotIndex) : fileNameWithExt;
                defaultTitle = decodeURIComponent(nameOnly);
            } catch (e) {
                console.error("لم يتمكن من استخراج الاسم:", e);
            }
        }

        const audioTitle = this.getAttribute('title') || defaultTitle;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin-bottom: 1.5rem;
                }

                .mdk-player-container {
                    --mdk-primary: #419150;
                    --mdk-primary-hover: #4caf50;
                    --mdk-text-main: #ffffff;
                    --mdk-text-muted: #e2e8f0;
                    
                    --mdk-bg-gradient: linear-gradient(135deg, rgba(40, 50, 45, 0.65) 0%, rgba(15, 20, 22, 0.85) 100%);
                    --mdk-bg-gradient-hover: linear-gradient(135deg, rgba(45, 55, 50, 0.75) 0%, rgba(18, 24, 26, 0.9) 100%);

                    background: var(--mdk-bg-gradient);
                    
                    
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    
                    padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 1.5rem);
                    display: flex;
                    align-items: center;
                    gap: clamp(1rem, 3vw, 1.5rem);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    width: 100%;
                    box-sizing: border-box;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    transition: box-shadow 0.3s ease, background 0.3s ease;
                }

                .mdk-player-container:hover {
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
                    background: var(--mdk-bg-gradient-hover);
                }

                .mdk-player-container * {
                    box-sizing: border-box;
                }

                .mdk-player-play-btn {
                    background: var(--mdk-primary);
                    width: clamp(50px, 12vw, 64px);
                    height: clamp(50px, 12vw, 64px);
                    flex-shrink: 0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s;
                    box-shadow: 0 6px 15px rgba(65, 145, 80, 0.3);
                    padding: 0;
                }

                .mdk-player-play-btn:hover {
                    transform: scale(1.05);
                    background: var(--mdk-primary-hover);
                }

                .mdk-player-play-btn:active {
                    transform: scale(0.95);
                }

                .mdk-player-play-btn svg {
                    width: clamp(24px, 6vw, 32px);
                    height: clamp(24px, 6vw, 32px);
                    fill: currentColor;
                }
                
                .mdk-player-icon-svg {
                    margin-inline-start: 4px;
                }

                .mdk-player-info {
                    flex-grow: 1;
                    min-width: 0; 
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .mdk-player-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }

                .mdk-player-title {
                    font-weight: 700;
                    color: var(--mdk-text-main);
                    font-size: clamp(1rem, 2.5vw, 1.15rem);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .mdk-player-title-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }

                .mdk-player-badge {
                    background: rgba(255, 255, 255, 0.15);
                    color: #fff;
                    padding: 0.25rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    line-height: 1;
                    flex-shrink: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .mdk-player-time {
                    color: var(--mdk-text-muted);
                    font-size: clamp(0.8rem, 2vw, 0.9rem);
                    font-variant-numeric: tabular-nums;
                    direction: ltr;
                    font-weight: 600;
                    flex-shrink: 0;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }

                .mdk-player-progress-area {
                    width: 100%;
                    height: 24px; 
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                .mdk-player-progress-track {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    position: relative;
                    overflow: visible;
                }

                .mdk-player-progress-bar {
                    height: 100%;
                    background: var(--mdk-primary);
                    width: 0%;
                    border-radius: 10px;
                    position: relative;
                    transition: width 0.1s linear;
                    box-shadow: 0 0 8px rgba(65, 145, 80, 0.5);
                }

                .mdk-player-progress-bar::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: -7px;
                    transform: translateY(-50%) scale(0);
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border: 2.5px solid var(--mdk-primary);
                    border-radius: 50%;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                }

                .mdk-player-progress-area:hover .mdk-player-progress-bar::after,
                .mdk-player-container.is-playing .mdk-player-progress-bar::after {
                    transform: translateY(-50%) scale(1);
                }

                @media (max-width: 480px) {
                    .mdk-player-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.4rem;
                    }
                    .mdk-player-title {
                        width: 100%;
                    }
                }
            </style>

            <div class="mdk-player-container">
                <button class="mdk-player-play-btn mdk-btn-action" title="تشغيل / إيقاف" type="button">
                    <svg class="mdk-play-icon mdk-player-icon-svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <svg class="mdk-pause-icon" style="display: none;" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>

                <div class="mdk-player-info">
                    <div class="mdk-player-header">
                        <div class="mdk-player-title">
                            <span class="mdk-player-title-text">${audioTitle}</span>
                            <span class="mdk-player-badge">صوت</span>
                        </div>
                        <div class="mdk-player-time">
                            <span class="mdk-current-time">00:00</span> / <span class="mdk-total-time">00:00</span>
                        </div>
                    </div>
                    
                    <div class="mdk-player-progress-area mdk-progress-action">
                        <div class="mdk-player-progress-track">
                            <div class="mdk-player-progress-bar"></div>
                        </div>
                    </div>
                </div>

                <audio class="mdk-main-audio" src="${fullAudioSrc}" preload="metadata"></audio>
            </div>
        `;

        this.initPlayer();
    }

    initPlayer() {
        const container = this.shadowRoot.querySelector('.mdk-player-container');
        const audio = this.shadowRoot.querySelector('.mdk-main-audio');
        const playPauseBtn = this.shadowRoot.querySelector('.mdk-btn-action');
        const playIcon = this.shadowRoot.querySelector('.mdk-play-icon');
        const pauseIcon = this.shadowRoot.querySelector('.mdk-pause-icon');
        const progressArea = this.shadowRoot.querySelector('.mdk-progress-action');
        const progressBar = this.shadowRoot.querySelector('.mdk-player-progress-bar');
        const currentTimeEl = this.shadowRoot.querySelector('.mdk-current-time');
        const totalTimeEl = this.shadowRoot.querySelector('.mdk-total-time');

        if (!audio || !playPauseBtn) return;

        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (audio.paused) {
                audio.play().catch(e => console.log("تشغيل محظور", e));
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                container.classList.add('is-playing');
            } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                container.classList.remove('is-playing');
            }
        });

        const formatTime = (time) => {
            if (isNaN(time)) return "00:00";
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time % 60);
            return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        };

        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.innerText = formatTime(audio.duration);
        });
        if (audio.readyState >= 1) {
            totalTimeEl.innerText = formatTime(audio.duration);
        }

        audio.addEventListener('timeupdate', () => {
            currentTimeEl.innerText = formatTime(audio.currentTime);
            if (audio.duration) {
                progressBar.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
            }
        });

        progressArea.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const ratio = (width - clickX) / width;
            audio.currentTime = ratio * audio.duration;
        });
        
        audio.addEventListener('ended', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            progressBar.style.width = '0%';
            container.classList.remove('is-playing');
            audio.currentTime = 0;
        });
    }
}

customElements.define('mdk-player', MdkPlayer);