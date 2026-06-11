// Módulo de conexión con Twitch API y EventSub WebSocket

const twitchConnection = {
    socket: null,
    token: null,
    broadcasterId: null,
    sessionId: null,
    onRewardRedeemed: null, // Callback cuando se canjea la recompensa específica
    
    // Inicializar conexión
    init(token) {
        this.token = token;
        this.connectWebSocket();
    },
    
    // Conectar al WebSocket de EventSub
    connectWebSocket() {
        this.socket = new WebSocket('wss://eventsub.wss.twitch.tv/ws');
        
        this.socket.onopen = () => {
            console.log('WebSocket conectado a Twitch EventSub');
        };
        
        this.socket.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
        
        this.socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket cerrado, reconectando en 5 segundos...');
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    },
    
    // Manejar mensajes del WebSocket
    async handleMessage(msg) {
        if (msg.metadata.message_type === 'session_welcome') {
            this.sessionId = msg.payload.session.id;
            console.log('Sesión WebSocket establecida, ID:', this.sessionId);
            await this.subscribeToRewards();
        }
        
        if (msg.metadata.message_type === 'notification') {
            const eventData = msg.payload.event;
            this.handleRewardRedemption(eventData);
        }
    },
    
    // Suscribirse a redenciones de puntos de canal
    async subscribeToRewards() {
        try {
            // Primero obtener el ID del broadcaster
            const userRes = await fetch('https://api.twitch.tv/helix/users', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Client-Id': CLIENT_ID
                }
            });
            
            const userData = await userRes.json();
            this.broadcasterId = userData.data[0].id;
            console.log('ID del broadcaster:', this.broadcasterId);
            
            // Suscribirse a redenciones
            const subRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Client-Id': CLIENT_ID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'channel.channel_points_custom_reward_redemption.add',
                    version: '1',
                    condition: {
                        broadcaster_user_id: this.broadcasterId
                    },
                    transport: {
                        method: 'websocket',
                        session_id: this.sessionId
                    }
                })
            });
            
            if (subRes.ok) {
                console.log('Suscrito exitosamente a redenciones de puntos de canal');
            } else {
                console.error('Error al suscribirse a redenciones:', await subRes.text());
            }
        } catch (e) {
            console.error('Error en suscripción:', e);
        }
    },
    
    // Manejar redención de recompensa
    handleRewardRedemption(eventData) {
        const { user_name, reward, id } = eventData;
        
        // Loggear TODAS las recompensas con su UUID para que el usuario pueda identificar la correcta
        console.log('=== REDENCIÓN RECIBIDA ===');
        console.log('Usuario:', user_name);
        console.log('Título de recompensa:', reward.title);
        console.log('UUID de recompensa:', reward.id);
        console.log('ID de redención:', id);
        console.log('========================');
        
        // Obtener el ID de recompensa configurado
        const configRewardId = configUI.getConfig().rewardId;
        
        // Verificar si es la recompensa específica que estamos buscando
        if (configRewardId && reward.id === configRewardId) {
            console.log('✓ REDENCIÓN DETECTADA: Es la recompensa específica configurada');
            
            // Emitir evento o llamar callback
            if (this.onRewardRedeemed) {
                this.onRewardRedeemed({
                    userName: user_name,
                    rewardTitle: reward.title,
                    rewardId: reward.id,
                    redemptionId: id
                });
            }
        } else if (!configRewardId) {
            console.log('⚠ No hay recompensa específica configurada. Configura el UUID en el panel (Shift+C)');
        } else {
            console.log('✗ Redención ignorada: No es la recompensa específica');
        }
    },
    
    // Establecer callback para cuando se canjee la recompensa específica
    onReward(callback) {
        this.onRewardRedeemed = callback;
    },
    
    // Cerrar conexión
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = twitchConnection;
}
