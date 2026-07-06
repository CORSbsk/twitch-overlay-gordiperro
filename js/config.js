// Configuración inicial
const CLIENT_ID = 'wzrtlpnuuigex61t9ymc4np9subyur';
const REDIRECT_URI = window.location.href.split('#')[0];

const defaultConfig = {
    rewardId: '',
    gordiperroCount: 0,
    gordiperroMinOffset: 14,
    gordiperroMaxOffset: 26,
    gordiperroCardWidth: 80,
    gordiperroCardHeight: 100
};
// Añadir valores por defecto para columnas y sonido
defaultConfig.gordiperroMaxColumnsPerSide = 5;
defaultConfig.soundCurrentPitch = 1.0;
defaultConfig.soundPitchIncrement = 0.02;
defaultConfig.alertMusicVolume = 0.5;
defaultConfig.barfVolume = 0.7;

// Estado de configuración
let config = { ...defaultConfig };

// UI de configuración
const configUI = {
    element: null,
    isVisible: false,
    keyboardListenerAdded: false,
    
    init() {
        this.element = document.getElementById('config-ui');
        console.log('configUI.init() llamado');
        console.log('Elemento #config-ui:', this.element);
        
        if (this.element) {
            console.log('Hijos del elemento antes de poblar:', this.element.children.length);
            if (this.element.children.length === 0) {
                console.log('Poblando UI...');
                this.populateUI();
                console.log('Hijos del elemento después de poblar:', this.element.children.length);
            } else {
                console.log('Elemento ya tiene contenido, no se poblará');
            }
        } else {
            console.error('Elemento #config-ui no encontrado en el DOM');
        }
        
        // Solo agregar el listener una vez
        if (!this.keyboardListenerAdded) {
            this.setupKeyboardListener();
            this.keyboardListenerAdded = true;
        }
    },
    
    populateUI() {
        console.log('Poblando UI de configuración...');
        this.element.innerHTML = `
            <div class="config-panel">
                <div class="scale-wrap">
                    <div class="config-content">
                        <h3>Configuración</h3>

                        <div class="config-tabs">
                            <div class="tab-headers">
                                <button class="tab-btn active" data-tab="tab-overlay">Overlay</button>
                                <button class="tab-btn" data-tab="tab-sound">Sonido</button>
                            </div>

                            <div class="tab-contents">
                                <div id="tab-overlay" class="tab">
                                    <label for="reward-id">ID de Recompensa (UUID):</label>
                                    <input type="text" id="reward-id" placeholder="Pega el UUID de la recompensa aquí">

                                    <label for="gordiperro-count">Contador de Gordiperros (manual):</label>
                                    <input type="number" id="gordiperro-count" min="0" value="0">

                                    <label for="gordiperro-min-offset">Dispersion vertical mínima (px):</label>
                                    <input type="number" id="gordiperro-min-offset" min="0" value="14">

                                    <label for="gordiperro-max-offset">Dispersion vertical máxima (px):</label>
                                    <input type="number" id="gordiperro-max-offset" min="0" value="26">

                                    <label for="gordiperro-card-width">Ancho de carta (px):</label>
                                    <input type="number" id="gordiperro-card-width" min="10" value="80">

                                    <label for="gordiperro-card-height">Alto de carta (px):</label>
                                    <input type="number" id="gordiperro-card-height" min="10" value="100">

                                    <label for="gordiperro-max-columns">Columnas máximas por lateral:</label>
                                    <input type="number" id="gordiperro-max-columns" min="1" value="5">
                                </div>

                                <div id="tab-sound" class="tab" style="display:none;">
                                    <label for="sound-current-pitch">Pitch inicial (barf):</label>
                                    <input type="number" id="sound-current-pitch" step="0.01" value="1.00">

                                    <label for="sound-pitch-increment">Incremento de pitch (por reproducción):</label>
                                    <input type="number" id="sound-pitch-increment" step="0.001" value="0.02">

                                    <label for="alert-music-volume">Volumen música alerta (0.0 - 1.0):</label>
                                    <input type="number" id="alert-music-volume" step="0.01" min="0" max="1" value="0.5">

                                    <label for="barf-volume">Volumen barf (0.0 - 1.0):</label>
                                    <input type="number" id="barf-volume" step="0.01" min="0" max="1" value="0.7">
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:10px;" class="config-buttons">
                            <button id="btn-save">Guardar Configuración</button>
                            <button id="btn-test-alert">Probar alerta</button>
                            <button id="btn-reset">Resetear sistema</button>
                            <button id="btn-close">Cerrar</button>
                        </div>

                        <div class="info">
                            <p><strong>Instrucciones:</strong></p>
                            <p>1. Presiona Shift+C para mostrar/ocultar este panel</p>
                            <p>2. Canjea la recompensa deseada en el chat</p>
                            <p>3. Revisa la consola del navegador (F12) para ver el UUID</p>
                            <p>4. Copia el UUID y pégalo aquí</p>
                            <p>5. Puedes ajustar manualmente el contador si es necesario</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar event listeners a los botones
        const btnSave = document.getElementById('btn-save');
        const btnClose = document.getElementById('btn-close');
        
        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveConfig());
            console.log('Event listener agregado a btn-save');
        } else {
            console.error('btn-save no encontrado');
        }

        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
            console.log('Event listener agregado a btn-close');
        } else {
            console.error('btn-close no encontrado');
        }

        const btnTest = document.getElementById('btn-test-alert');
        if (btnTest) {
            btnTest.addEventListener('click', () => {
                if (typeof alertManager !== 'undefined' && typeof alertManager.handleRewardRedemption === 'function') {
                    alertManager.handleRewardRedemption({ test: true });
                } else {
                    console.error('alertManager no disponible para prueba de alerta');
                }
            });
            console.log('Event listener agregado a btn-test-alert');
        } else {
            console.error('btn-test-alert no encontrado');
        }

        const btnReset = document.getElementById('btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (typeof storage !== 'undefined') {
                    storage.clearAll();
                }
                if (typeof alertManager !== 'undefined' && typeof alertManager.reset === 'function') {
                    alertManager.reset();
                }
                config = { ...defaultConfig };
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('twitchOverlayConfig');
                    localStorage.removeItem('twitchOverlayCount');
                }
                if (typeof cardDistributor !== 'undefined' && typeof cardDistributor.applyConfig === 'function') {
                    cardDistributor.applyConfig();
                }
                this.show();
                console.log('Sistema reseteado por usuario');
            });
            console.log('Event listener agregado a btn-reset');
        } else {
            console.error('btn-reset no encontrado');
        }
        // Inicializar comportamiento de pestañas
        const tabButtons = this.element.querySelectorAll('.tab-btn');
        const showTab = (id) => {
            this.element.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
            this.element.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            const tab = this.element.querySelector(`#${id}`);
            if (tab) tab.style.display = 'block';
            const btn = this.element.querySelector(`.tab-btn[data-tab="${id}"]`);
            if (btn) btn.classList.add('active');
            setTimeout(() => this.adjustScale(), 30);
        };

        tabButtons.forEach(b => b.addEventListener('click', (e) => showTab(b.dataset.tab)));
        showTab('tab-overlay');
    },
    
    show() {
        console.log('Mostrando UI de configuración...');
        console.log('Elemento config-ui:', this.element);
        console.log('Hijos del elemento:', this.element ? this.element.children.length : 0);
        
        if (this.element) {
            // Verificar si el elemento tiene contenido
            if (this.element.children.length === 0) {
                console.log('Elemento vacío, poblando...');
                this.populateUI();
            }
            this.element.classList.add('visible');
            console.log('Clase visible agregada');
            console.log('Estilo display:', window.getComputedStyle(this.element).display);
            // Ajustar escala para que todo quepa sin scroll
            setTimeout(() => this.adjustScale(), 40);
            
            // Cargar valores actuales
            const rewardIdInput = document.getElementById('reward-id');
            const countInput = document.getElementById('gordiperro-count');
            const minOffsetInput = document.getElementById('gordiperro-min-offset');
            const maxOffsetInput = document.getElementById('gordiperro-max-offset');
            const cardWidthInput = document.getElementById('gordiperro-card-width');
            const cardHeightInput = document.getElementById('gordiperro-card-height');
            const maxColumnsInput = document.getElementById('gordiperro-max-columns');
            const soundPitchInput = document.getElementById('sound-current-pitch');
            const soundPitchIncInput = document.getElementById('sound-pitch-increment');
            const alertMusicVolInput = document.getElementById('alert-music-volume');
            const barfVolInput = document.getElementById('barf-volume');
            
            if (rewardIdInput) {
                rewardIdInput.value = config.rewardId || '';
                console.log('Valor de reward-id cargado:', config.rewardId);
            } else {
                console.error('Elemento reward-id no encontrado');
            }
            
            if (countInput) {
                countInput.value = config.gordiperroCount || 0;
                console.log('Valor de gordiperro-count cargado:', config.gordiperroCount);
            } else {
                console.error('Elemento gordiperro-count no encontrado');
            }

            if (minOffsetInput) {
                minOffsetInput.value = config.gordiperroMinOffset || 14;
            } else {
                console.error('Elemento gordiperro-min-offset no encontrado');
            }

            if (maxOffsetInput) {
                maxOffsetInput.value = config.gordiperroMaxOffset || 26;
            } else {
                console.error('Elemento gordiperro-max-offset no encontrado');
            }

            if (cardWidthInput) {
                cardWidthInput.value = config.gordiperroCardWidth || 80;
            } else {
                console.error('Elemento gordiperro-card-width no encontrado');
            }

            if (cardHeightInput) {
                cardHeightInput.value = config.gordiperroCardHeight || 100;
            } else {
                console.error('Elemento gordiperro-card-height no encontrado');
            }

            if (maxColumnsInput) {
                maxColumnsInput.value = config.gordiperroMaxColumnsPerSide || 5;
            } else {
                console.error('Elemento gordiperro-max-columns no encontrado');
            }

            if (soundPitchInput) {
                soundPitchInput.value = typeof config.soundCurrentPitch === 'number' ? config.soundCurrentPitch : 1.0;
            }

            if (soundPitchIncInput) {
                soundPitchIncInput.value = typeof config.soundPitchIncrement === 'number' ? config.soundPitchIncrement : 0.02;
            }

            if (alertMusicVolInput) {
                alertMusicVolInput.value = typeof config.alertMusicVolume === 'number' ? config.alertMusicVolume : 0.5;
            }

            if (barfVolInput) {
                barfVolInput.value = typeof config.barfVolume === 'number' ? config.barfVolume : 0.7;
            }
        } else {
            console.error('Elemento config-ui no existe');
        }
        // Estado ya se actualizó en toggle()
    },

    adjustScale() {
        try {
            const panel = this.element.querySelector('.config-panel');
            const content = this.element.querySelector('.config-content');
            const wrap = this.element.querySelector('.scale-wrap');
            if (!panel || !content || !wrap) return;

            // Forzar layout then medir
            content.style.transform = 'none';
            requestAnimationFrame(() => {
                const panelRect = panel.getBoundingClientRect();
                const contentRect = content.getBoundingClientRect();

                const scaleW = panelRect.width / contentRect.width;
                const scaleH = panelRect.height / contentRect.height;
                const scale = Math.min(scaleW, scaleH, 1);

                content.style.transform = `scale(${scale})`;
                // ajustar el alto del wrapper para mantener el contenido visible
                wrap.style.height = (contentRect.height * scale) + 'px';
            });
        } catch (e) {
            console.error('Error en adjustScale:', e);
        }
    },
    
    close() {
        console.log('Cerrando UI de configuración...');
        if (this.element) {
            this.element.classList.remove('visible');
            console.log('Clase visible removida');
        }
        // Estado ya se actualizó en toggle()
    },
    
    toggle() {
        console.log('Toggle llamado, isVisible:', this.isVisible);
        // Actualizar estado ANTES de llamar a show/close
        if (this.isVisible) {
            this.isVisible = false;
            this.close();
        } else {
            this.isVisible = true;
            this.show();
        }
    },
    
    saveConfig() {
        const rewardIdInput = document.getElementById('reward-id').value.trim();
        const countInput = parseInt(document.getElementById('gordiperro-count').value) || 0;
        const minOffsetInput = parseInt(document.getElementById('gordiperro-min-offset').value) || 14;
        const maxOffsetInput = parseInt(document.getElementById('gordiperro-max-offset').value) || 26;
        const cardWidthInput = parseInt(document.getElementById('gordiperro-card-width').value) || 80;
        const cardHeightInput = parseInt(document.getElementById('gordiperro-card-height').value) || 100;

        config.rewardId = rewardIdInput;
        config.gordiperroCount = countInput;
        config.gordiperroMinOffset = Math.min(minOffsetInput, maxOffsetInput);
        config.gordiperroMaxOffset = Math.max(minOffsetInput, maxOffsetInput);
        config.gordiperroCardWidth = Math.max(10, cardWidthInput);
        config.gordiperroCardHeight = Math.max(10, cardHeightInput);
        // Nuevos valores: columnas y sonido
        const maxColumnsInputVal = parseInt(document.getElementById('gordiperro-max-columns').value) || 5;
        const soundPitchVal = parseFloat(document.getElementById('sound-current-pitch').value) || 1.0;
        const soundPitchIncVal = parseFloat(document.getElementById('sound-pitch-increment').value) || 0.02;
        const alertMusicVolVal = parseFloat(document.getElementById('alert-music-volume').value);
        const barfVolVal = parseFloat(document.getElementById('barf-volume').value);

        config.gordiperroMaxColumnsPerSide = Math.max(1, maxColumnsInputVal);
        config.soundCurrentPitch = isNaN(soundPitchVal) ? 1.0 : soundPitchVal;
        config.soundPitchIncrement = isNaN(soundPitchIncVal) ? 0.02 : soundPitchIncVal;
        config.alertMusicVolume = isNaN(alertMusicVolVal) ? 0.5 : Math.min(Math.max(alertMusicVolVal, 0), 1);
        config.barfVolume = isNaN(barfVolVal) ? 0.7 : Math.min(Math.max(barfVolVal, 0), 1);

        // Guardar en localStorage
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('twitchOverlayConfig', JSON.stringify(config));
        }

        if (typeof cardDistributor !== 'undefined' && typeof cardDistributor.applyConfig === 'function') {
            cardDistributor.applyConfig();
        }

        // Aplicar configuración de sonido si está disponible
        if (typeof soundManager !== 'undefined' && typeof soundManager.applyConfig === 'function') {
            soundManager.applyConfig();
        }

        // Guardar contador en storage y aplicar al sistema inmediatamente
        if (typeof storage !== 'undefined' && typeof storage.setCount === 'function') {
            storage.setCount(countInput);
        }

        if (typeof alertManager !== 'undefined' && typeof alertManager.setCount === 'function') {
            alertManager.setCount(countInput);
        }

        console.log('Configuración guardada:', config);
        alert('Configuración guardada correctamente');
    },
    
    loadConfig() {
        if (typeof Storage !== 'undefined') {
            const saved = localStorage.getItem('twitchOverlayConfig');
            console.log('Valor en twitchOverlayConfig:', saved);
            
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    console.log('Configuración parseada:', parsed);
                    config = { ...config, ...parsed };
                    console.log('Configuración cargada (antes de priorizar storage):', config);
                } catch (e) {
                    console.error('Error al cargar configuración:', e);
                }
            }
            
            // Priorizar el contador de storage.js sobre el de config
            if (typeof storage !== 'undefined' && typeof storage.loadCount === 'function') {
                const storageCount = storage.loadCount();
                console.log('Contador de storage.js:', storageCount);
                console.log('Contador de config antes de priorizar:', config.gordiperroCount);
                
                // Siempre usar el valor de storage.js, incluso si es 0
                config.gordiperroCount = storageCount;
                console.log('Contador de storage.js tiene prioridad, nuevo valor:', config.gordiperroCount);
            }
        }
    },
    
    setupKeyboardListener() {
        let lastKeyPressTime = 0;
        const DEBOUNCE_TIME = 1000; // 1000ms de debounce (1 segundo)
        
        document.addEventListener('keydown', (e) => {
            // Shift+C para mostrar/ocultar configuración
            if (e.shiftKey && e.key === 'C') {
                const currentTime = Date.now();
                const timeSinceLastPress = currentTime - lastKeyPressTime;
                
                console.log(`Shift+C presionado, tiempo desde último: ${timeSinceLastPress}ms`);
                
                // Solo procesar si ha pasado suficiente tiempo desde el último disparo
                if (timeSinceLastPress > DEBOUNCE_TIME) {
                    e.preventDefault();
                    lastKeyPressTime = currentTime;
                    console.log('Shift+C procesado (debounce pasado)');
                    this.toggle();
                } else {
                    console.log('Shift+C ignorado (debounce activo)');
                }
            }
        });
        // Recalcular escala al redimensionar la ventana cuando el panel está visible
        window.addEventListener('resize', () => {
            if (this.isVisible) {
                this.adjustScale();
            }
        });
    },
    
    getConfig() {
        return config;
    },
    
    updateCount(newCount) {
        config.gordiperroCount = newCount;
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('twitchOverlayConfig', JSON.stringify(config));
        }
        // También actualizar en storage.js para mantener sincronización
        if (typeof storage !== 'undefined' && typeof storage.setCount === 'function') {
            storage.setCount(newCount);
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configUI;
}
