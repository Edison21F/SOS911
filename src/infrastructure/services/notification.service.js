const { Expo } = require('expo-server-sdk');

// Crear un nuevo cliente de Expo SDK
const expo = new Expo();

/**
 * Envía notificaciones push a un array de tokens.
 * @param {string[]} pushTokens - Array de tokens 'ExponentPushToken[...]'
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo del mensaje
 * @param {object} data - Datos adicionales (ej: { alertId: 123 })
 */
const sendPushNotifications = async (pushTokens, title, body, data = {}) => {
    let messages = [];

    for (let pushToken of pushTokens) {
        // Verificar que el token es válido
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Token de push inválido: ${pushToken}`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high', // Alta prioridad para emergencias
            channelId: 'emergencias', // Canal específico en Android (configurar en app)
        });
    }

    // Expo recomienda dividir en lotes (chunks) para reducir errores
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error enviando chunk de notificaciones:', error);
        }
    }

    // (Opcional) Aquí se podría verificar los tickets para ver si hubo errores (ej: DeviceNotRegistered)
    return tickets;
};

module.exports = { sendPushNotifications };
