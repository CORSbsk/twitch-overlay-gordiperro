// Configuración inicial
const CLIENT_ID = 'wzrtlpnuuigex61t9ymc4np9subyur';
const REDIRECT_URI = window.location.href.split('#')[0];

// Estado de configuración
let config = {
    rewardId: '', // Placeholder para el ID de la recompensa específica
    gordiperroCount: 0 // Contador histórico de gordiperros
};

// UI de configuración
const configUI = {
    element: null,
    isVisible: false,
    
    init() {
        this.element = document.getElementById('config-ui');
        if (!this.element) {
            this.createUI();
        }
        this.setupKeyboardListener();
    },
    
    createUI() {
        const ui = document.createElement('div');
        ui.id = 'config-ui';
        ui.innerHTML = `
            <h3>Configuración del Overlay</h3>
            <label for="reward-id">ID de Recompensa (UUID):</label>
            <input type="text" id="reward-id" placeholder="Pega el UUID de la recompensa aquí">
            
            <label for="gordiperro-count">Contador de Gordiperros (manual):</label>
            <input type="number" id="gordiperro-count" min="0" value="0">
            
            <button onclick="configUI.saveConfig()">Guardar Configuración</button>
            <button onclick="configUI.close()">Cerrar</button>
            
            <div class="info">
                <p><strong>Instrucciones:</strong></p>
                <p>1. Presiona Shift+C para mostrar/ocultar este panel</p>
                <p>2. Canjea la recompensa deseada en el chat</p>
                <p>3. Revisa la consola del navegador (F12) para ver el UUID</p>
                <p>4. Copia el UUID y pégalo aquí</p>
                <p>5. Puedes ajustar manualmente el contador si es necesario</p>
            </div>
        `;
        document.body.appendChild(ui);
        this.element = ui;
    },
    
    show() {
        if (this.element) {
            this.element.classList.add('visible');
            // Cargar valores actuales
            document.getElementById('reward-id').value = config.rewardId || '';
            document.getElementById('gordiperro-count').value = config.gordiperroCount || 0;
        }
        this.isVisible = true;
    },
    
    close() {
        if (this.element) {
            this.element.classList.remove('visible');
        }
        this.isVisible = false;
    },
    
    toggle() {
        if (this.isVisible) {
            this.close();
        } else {
            this.show();
        }
    },
    
    saveConfig() {
        const rewardIdInput = document.getElementById('reward-id').value.trim();
        const countInput = parseInt(document.getElementById('gordiperro-count').value) || 0;
        
        config.rewardId = rewardIdInput;
        config.gordiperroCount = countInput;
        
        // Guardar en localStorage
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('twitchOverlayConfig', JSON.stringify(config));
        }
        
        console.log('Configuración guardada:', config);
        alert('Configuración guardada correctamente');
    },
    
    loadConfig() {
        if (typeof Storage !== 'undefined') {
            const saved = localStorage.getItem('twitchOverlayConfig');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    config = { ...config, ...parsed };
                    console.log('Configuración cargada:', config);
                } catch (e) {
                    console.error('Error al cargar configuración:', e);
                }
            }
        }
    },
    
    setupKeyboardListener() {
        document.addEventListener('keydown', (e) => {
            // Shift+C para mostrar/ocultar configuración
            if (e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggle();
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
    }
};

// Inicializar configuración
configUI.loadConfig();

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configUI;
}
