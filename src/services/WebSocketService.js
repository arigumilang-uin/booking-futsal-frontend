// src/services/WebSocketService.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.listeners = new Map();
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.userId = null;
    this.userRole = null;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
  }

  // Initialize WebSocket connection
  connect(userId, userRole, token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('🔌 WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    this.userRole = userRole;

    // Use production backend WebSocket URL
    const wsUrl = `wss://booking-soccer-production.up.railway.app/ws?token=${token}&userId=${userId}&role=${userRole}`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Setup WebSocket event handlers
  setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      console.log('✅ WebSocket connected successfully');
      this.isConnecting = false;
      this.isAuthenticated = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected', { userId: this.userId, role: this.userRole });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        this.handleMessage(data);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', event.code, event.reason);
      this.isConnecting = false;
      this.isAuthenticated = false;
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'notification':
        this.emit('notification', payload);
        break;
      case 'booking_update':
        this.emit('booking_update', payload);
        break;
      case 'payment_update':
        this.emit('payment_update', payload);
        break;
      case 'system_alert':
        this.emit('system_alert', payload);
        break;
      case 'user_activity':
        this.emit('user_activity', payload);
        break;
      case 'heartbeat':
        this.handleHeartbeat(payload);
        break;
      case 'auth_required':
        this.handleAuthRequired(payload);
        break;
      case 'error':
        console.error('❌ WebSocket server error:', payload);
        this.emit('server_error', payload);
        break;
      default:
        console.log('📨 Unknown message type:', type, payload);
        this.emit('unknown_message', { type, payload });
    }
  }

  // Handle heartbeat messages
  handleHeartbeat(payload) {
    console.log('💓 Heartbeat received:', payload);
    // Send heartbeat response
    this.send('heartbeat_response', { timestamp: Date.now() });
  }

  // Handle authentication required
  handleAuthRequired(payload) {
    console.log('🔐 Authentication required:', payload);
    this.isAuthenticated = false;
    this.emit('auth_required', payload);
  }

  // Start heartbeat mechanism
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: Date.now() });
        
        // Set timeout for heartbeat response
        this.heartbeatTimeout = setTimeout(() => {
          console.log('💔 Heartbeat timeout - connection may be dead');
          this.ws.close();
        }, 10000); // 10 seconds timeout
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat mechanism
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // Send message to WebSocket server
  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      console.log('📤 WebSocket message sent:', { type, payload });
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent:', { type, payload });
      return false;
    }
  }

  // Subscribe to specific notification types
  subscribeToNotifications(userId, role) {
    this.send('subscribe', {
      userId,
      role,
      types: ['notification', 'booking_update', 'payment_update', 'system_alert']
    });
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications() {
    this.send('unsubscribe', {
      userId: this.userId,
      role: this.userRole
    });
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.userId && this.userRole) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.connect(this.userId, this.userRole, token);
        }
      }
    }, delay);
  }

  // Disconnect WebSocket
  disconnect() {
    console.log('🔌 Disconnecting WebSocket');
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.userId = null;
    this.userRole = null;
    this.reconnectAttempts = 0;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return this.isAuthenticated ? 'connected' : 'authenticating';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Check if connected and authenticated
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
