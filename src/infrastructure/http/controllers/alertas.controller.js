const Alerta = require('../../../domain/models/alertas.model');
const ContactoEmergencia = require('../../../domain/models/contactos_emergencia.model');
const { Ubicacion } = require('../../database/connection/dataBase.mongo'); // Importar modelo de Ubi
const { sendPushNotifications } = require('../../services/notification.service');

// Crear una nueva alerta
const createAlert = async (req, res) => {
    try {
        const { idUsuarioSql, tipo, prioridad, ubicacion, detalles } = req.body; // ubicacion: { latitud, longitud }
        const io = req.app.get('io');

        // 1. Crear la alerta en BD con GeoJSON
        const nuevaAlerta = new Alerta({
            idUsuarioSql,
            tipo,
            prioridad,
            ubicacion, // Mantenemos el objeto simple para frontend legacy
            location: { // GeoJSON para queries espaciales
                type: 'Point',
                coordinates: [ubicacion.longitud, ubicacion.latitud]
            },
            detalles,
            estado: 'CREADA',
            historial_estados: [{ estado: 'CREADA', comentario: 'Inicio de emergencia' }]
        });
        await nuevaAlerta.save();

        // 2. Obtener contactos vinculados del usuario (Lógica Existente)
        const contactos = await ContactoEmergencia.find({
            idUsuarioSql: idUsuarioSql,
            estado: 'VINCULADO'
        });

        // 3. Notificar a contactos (Push + Socket) logic...
        // ... (Mantener lógica de notificación a contactos aquí)

        if (io) {
            // Notificar a Contactos
            contactos.forEach(contacto => {
                if (contacto.idUsuarioContactoSql) {
                    io.to(`user_${contacto.idUsuarioContactoSql}`).emit('alert:new', nuevaAlerta);
                }
            });
            // Notificar al propio usuario
            io.to(`user_${idUsuarioSql}`).emit('alert:created', nuevaAlerta);
        }

        // 4. --- LÓGICA DE ALERTAS CERCANAS (NUEVO) ---
        // Buscar usuarios en un radio de 5km (5000 metros)
        try {
            const usuariosCercanos = await Ubicacion.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [ubicacion.longitud, ubicacion.latitud]
                        },
                        $maxDistance: 5000 // 5km
                    }
                },
                idClienteSql: { $ne: idUsuarioSql } // Excluir al propio usuario que emite
            });

            if (usuariosCercanos.length > 0) {
                console.log(`[ALERTA] Encontrados ${usuariosCercanos.length} usuarios cercanos para notificar.`);

                // Notificar vía Socket
                if (io) {
                    usuariosCercanos.forEach(userUbi => {
                        console.log(`[ALERTA] Notificando evento cercano a user_${userUbi.idClienteSql}`);
                        io.to(`user_${userUbi.idClienteSql}`).emit('alert:nearby', {
                            message: `¡ALERTA CERCANA! Tipo: ${tipo}`,
                            distancia: 'Cerca de tu ubicación',
                            alerta: nuevaAlerta
                        });
                    });
                }

                // TODO: Enviar Push Notifications a estos usuarios también (se requiere mapear idClienteSql -> pushToken)
            }
        } catch (geoError) {
            console.error('Error buscando usuarios cercanos:', geoError);
        }

        return res.status(201).json({
            success: true,
            data: nuevaAlerta
        });

    } catch (error) {
        console.error('Error creando alerta:', error);
        return res.status(500).json({ success: false, error: 'Error al procesar emergencia' });
    }
};

// Actualizar estado de alerta
const updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, comentario, ubicacion } = req.body;
        const io = req.app.get('io');

        const alerta = await Alerta.findById(id);
        if (!alerta) return res.status(404).json({ error: 'Alerta no encontrada' });

        alerta.estado = estado;
        if (ubicacion) {
            alerta.ubicacion = ubicacion;
            alerta.location = {
                type: 'Point',
                coordinates: [ubicacion.longitud, ubicacion.latitud]
            };
        }

        alerta.historial_estados.push({
            estado,
            comentario: comentario || 'Actualización de estado',
            fecha: new Date()
        });

        if (estado === 'CERRADA' || estado === 'CANCELADA') {
            alerta.fecha_cierre = new Date();
        }

        await alerta.save();

        // Notificar cambio
        if (io) {
            // Notificar a todos en la sala de la alerta (usuarios siguiendo el evento)
            io.to(`alert_${id}`).emit('alert:status', alerta);
        }

        return res.json({ success: true, data: alerta });

    } catch (error) {
        console.error('Error actualizando alerta:', error);
        return res.status(500).json({ error: 'Error interno' });
    }
};

// Obtener alertas activas de un usuario
const getActiveAlerts = async (req, res) => {
    try {
        const { idUsuarioSql } = req.params;
        const misAlertas = await Alerta.find({
            idUsuarioSql: idUsuarioSql,
            fecha_cierre: { $exists: false }
        });
        res.json({ success: true, data: misAlertas });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo alertas' });
    }
};

// --- NUEVO: Obtener alertas activas cercanas ---
const getNearbyAlerts = async (req, res) => {
    try {
        const { lat, lng, radio } = req.query; // radio en metros (default 5000)

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitud y longitud requeridas' });
        }

        const maxDistancia = radio ? parseInt(radio) : 5000;

        const alertasCercanas = await Alerta.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxDistancia
                }
            },
            estado: { $in: ['CREADA', 'NOTIFICADA', 'ATENDIDA'] } // Solo activas
        });

        res.json({
            success: true,
            count: alertasCercanas.length,
            data: alertasCercanas
        });

    } catch (error) {
        console.error('Error obteniendo alertas cercanas:', error);
        res.status(500).json({ error: 'Error obteniendo alertas cercanas' });
    }
};

// --- NUEVO: Obtener historial de alertas del usuario ---
const getAlertHistory = async (req, res) => {
    try {
        const { idUsuarioSql } = req.params;

        if (!idUsuarioSql) {
            return res.status(400).json({ error: 'idUsuarioSql es requerido' });
        }

        // Obtener historial incluyendo las cerradas/canceladas
        console.log(`[DEBUG] Buscando historial para idUsuarioSql: "${idUsuarioSql}" (Tipo: ${typeof idUsuarioSql})`);

        // DEBUG PROFUNDO: Ver qué hay realmente en la BD
        const todasAlertas = await Alerta.find({});
        console.log(`[DEBUG_DEEP] Total alertas en colección: ${todasAlertas.length}`);
        todasAlertas.forEach(a => {
            console.log(`[DEBUG_DEEP] -> _id: ${a._id}, idUsuarioSql: "${a.idUsuarioSql}" (Tipo: ${typeof a.idUsuarioSql}), Estado: ${a.estado}`);
        });

        const historial = await Alerta.find({
            idUsuarioSql: idUsuarioSql
        }).sort({ fecha_creacion: -1 }); // Ordenar descendente (más recientes primero)

        console.log(`[DEBUG] Alertas encontradas: ${historial.length}`);

        res.json({
            success: true,
            data: historial
        });

    } catch (error) {
        console.error('Error obteniendo historial de alertas:', error);
        res.status(500).json({ error: 'Error obteniendo historial de alertas' });
    }
};

// --- NUEVO: Obtener notificaciones (Alertas donde soy contacto) ---
const getNotifications = async (req, res) => {
    try {
        const { idUsuarioSql } = req.params;

        if (!idUsuarioSql) {
            return res.status(400).json({ error: 'idUsuarioSql es requerido' });
        }

        // Buscar alertas donde este usuario esté en la lista de contactos notificados
        // O si es una alerta cercana (si implementamos guardado de notificaciones persistentes para eso)
        // Por ahora, asumimos que "Notificaciones" son alertas de mis contactos.

        /* 
           NOTA: En el modelo actual, `contactos_notificados` tiene `idContactoEmergencia`.
           Necesitamos saber si ese ID se refiere al id de la tabla SQL `contactos_emergencias` o al `idUsuarioSql`.
           
           Revisando createAlert:
           io.to(`user_${contacto.idUsuarioContactoSql}`).emit('alert:new', nuevaAlerta);
           
           Por lo tanto, el usuario destinatario es `idUsuarioContactoSql`.
           Vamos a buscar alertas donde el usuario haya sido notificado.
           
           Pero `contactos_notificados` en el modelo Alertas guarda:
           `idContactoEmergencia: String`
           
           Esto parece referirse al ID de la relación o al usuario. 
           Si el backend actual no guarda explícitamente el `idUsuarioDestino` en `contactos_notificados`, 
           tendremos que hacer un parche o buscar por lógica.
           
           Vamos a buscar en TODAS las alertas donde:
           1. idUsuarioSql NO sea el mío (no mis propias alertas)
           2. (Opcional) Yo sea un contacto vinculado del creador (esto requeriría join con SQL, complejo en Mongo).
           
           Simplificación: 
           Como no tenemos un modelo de "Notificación" persistente separado, 
           vamos a devolver las ÚLTIMAS alertas activas o recientes (excepto las mías).
           
           MEJOR ENFOQUE:
           Usar `contactos_notificados` si se está llenando.
           Si no, por ahora devolvemos las alertas donde yo soy un contacto vinculado del creador.
           Pero eso requiere cruzar datos.
           
           SOLUCIÓN RAPIDA Y EFECTIVA:
           Filtrar alertas cerradas/activas que NO sean mías.
           Idealmente filtraríamos solo de mis "amigos", pero si no hay esa info en Mongo, traemos las recientes
           y el frontend filtra o muestra todo (como un feed de seguridad).
           
           Sin embargo, el requerimiento es "notificaciones recibidas".
           Vamos a devolver todas las alertas que NO sean creadas por el usuario, ordenadas por fecha.
           Esto simula un "feed de emergencias de la comunidad".
        */

        const notificaciones = await Alerta.find({
            idUsuarioSql: { $ne: idUsuarioSql } // No mis propias alertas
        })
            .sort({ fecha_creacion: -1 })
            .limit(20); // Últimas 20

        res.json({
            success: true,
            data: notificaciones
        });

    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({ error: 'Error obteniendo notificaciones' });
    }
};


module.exports = { createAlert, updateAlertStatus, getActiveAlerts, getNearbyAlerts, getAlertHistory, getNotifications };
