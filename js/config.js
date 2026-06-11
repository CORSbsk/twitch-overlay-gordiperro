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
        this.setupKeyboardListener();
    },
    
    populateUI() {
        console.log('Poblando UI de configuración...');
        this.element.innerHTML = `
            <h3>Configuración del Overlay</h3>
            <label for="reward-id">ID de Recompensa (UUID):</label>
            <input type="text" id="reward-id" placeholder="Pega el UUID de la recompensa aquí">
            
            <label for="gordiperro-count">Contador de Gordiperros (manual):</label>
            <input type="number" id="gordiperro-count" min="0" value="0">
            
            <button id="btn-save">Guardar Configuración</button>
            <button id="btn-close">Cerrar</button>
            
            <div class="info">
                <p><strong>Instrucciones:</strong></p>
                <p>1. Presiona Shift+C para mostrar/ocultar este panel</p>
                <p>2. Canjea la recompensa deseada en el chat</p>
                <p>3. Revisa la consola del navegador (F12) para ver el UUID</p>
                <p>4. Copia el UUID y pégalo aquí</p>
                <p>5. Puedes ajustar manualmente el contador si es necesario</p>
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
            
            // Cargar valores actuales
            const rewardIdInput = document.getElementById('reward-id');
            const countInput = document.getElementById('gordiperro-count');
            
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
        } else {
            console.error('Elemento config-ui no existe');
        }
        this.isVisible = true;
    },
    
    close() {
        console.log('Cerrando UI de configuración...');
        if (this.element) {
            this.element.classList.remove('visible');
            console.log('Clase visible removida');
        }
        this.isVisible = false;
    },
    
    toggle() {
        console.log('Toggle llamado, isVisible:', this.isVisible);
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
        let isProcessing = false;
        
        document.addEventListener('keydown', (e) => {
            // Shift+C para mostrar/ocultar configuración
            if (e.shiftKey && e.key === 'C' && !isProcessing) {
                e.preventDefault();
                isProcessing = true;
                console.log('Shift+C detectado');
                this.toggle();
                
                // Evitar múltiples disparos rápidos
                setTimeout(() => {
                    isProcessing = false;
                }, 300);
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
