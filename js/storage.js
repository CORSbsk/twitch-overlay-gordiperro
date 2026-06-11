// Módulo de persistencia usando localStorage

const storage = {
    CONFIG_KEY: 'twitchOverlayConfig',
    COUNT_KEY: 'twitchOverlayCount',
    
    // Guardar configuración completa
    saveConfig(config) {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
            console.log('Configuración guardada en localStorage:', config);
            return true;
        } catch (e) {
            console.error('Error al guardar configuración:', e);
            return false;
        }
    },
    
    // Cargar configuración completa
    loadConfig() {
        try {
            const saved = localStorage.getItem(this.CONFIG_KEY);
            if (saved) {
                const config = JSON.parse(saved);
                console.log('Configuración cargada desde localStorage:', config);
                return config;
            }
        } catch (e) {
            console.error('Error al cargar configuración:', e);
        }
        return null;
    },
    
    // Guardar contador de gordiperros
    saveCount(count) {
        try {
            localStorage.setItem(this.COUNT_KEY, count.toString());
            console.log('Contador guardado:', count);
            return true;
        } catch (e) {
            console.error('Error al guardar contador:', e);
            return false;
        }
    },
    
    // Cargar contador de gordiperros
    loadCount() {
        try {
            const saved = localStorage.getItem(this.COUNT_KEY);
            if (saved !== null) {
                const count = parseInt(saved, 10);
                console.log('Contador cargado:', count);
                return count;
            }
        } catch (e) {
            console.error('Error al cargar contador:', e);
        }
        return 0;
    },
    
    // Incrementar contador
    incrementCount() {
        const currentCount = this.loadCount();
        const newCount = currentCount + 1;
        this.saveCount(newCount);
        return newCount;
    },
    
    // Establecer contador manualmente
    setCount(count) {
        const newCount = parseInt(count, 10) || 0;
        this.saveCount(newCount);
        return newCount;
    },
    
    // Limpiar todos los datos (para reset)
    clearAll() {
        try {
            localStorage.removeItem(this.CONFIG_KEY);
            localStorage.removeItem(this.COUNT_KEY);
            console.log('Todos los datos han sido limpiados');
            return true;
        } catch (e) {
            console.error('Error al limpiar datos:', e);
            return false;
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storage;
}
