const mongoose = require('mongoose');
const { MONGO_URI } = require('../../../config/keys');

// 1. CONFIGURACIÓN DE EVENTOS DE CONEXIÓN 
mongoose.connection.on('connected', () => {
    console.log('✅ Conexión exitosa y establecida con MongoDB');
});

mongoose.connection.on('error', err => {
    console.error('❌ Error en la conexión de MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Se ha perdido la conexión con MongoDB');
});

// 2. FUNCIÓN DE CONEXIÓN MEJORADA (Tu lógica moderna y para producción)
const connectMongoDB = async () => {
    // Opciones de conexión modernas
    const MONGODB_OPTIONS = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
    };

    try {
        let finalMongoUri = MONGO_URI;

        // Lógica para manejar la contraseña en producción (VPS)
        if (process.env.MONGO_PASSWORD) {
            console.log('Detectada contraseña de MongoDB para producción. Construyendo URI segura...');
            const encodedPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
            finalMongoUri = MONGO_URI.replace('<PASSWORD>', encodedPassword);
        }

        // Se conecta usando la URI final y las opciones modernas.
        await mongoose.connect(finalMongoUri, MONGODB_OPTIONS);

    } catch (error) {
        console.error('💥 FALLA CRÍTICA en conexión MongoDB:', error.message);
        process.exit(1);
    }
};

// 3. MANEJO DE CIERRE DE APLICACIÓN (Como en el ejemplo del profesor)
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada debido a la terminación de la aplicación');
    process.exit(0);
});

// 4. INICIAR CONEXIÓN Y EXPORTAR MODELOS
connectMongoDB();

const Usuario = require('../../../domain/models/usuarios.model');
const ContenidoApp = require('../../../domain/models/contenido_app.model');
const Cliente = require('../../../domain/models/clientes.model');
const ServicioEmergencia = require('../../../domain/models/servicios_emergencia');
const Grupo = require('../../../domain/models/grupos.model');
const Preferencias = require('../../../domain/models/preferencias.model');
const ContenidoPagina = require('../../../domain/models/pagina.model');
const MensajeGrupo = require('../../../domain/models/mensajes_grupo.model');

module.exports = {
    Usuario,
    ContenidoApp,
    Cliente,
    ServicioEmergencia,
    Grupo,
    Preferencias,
    ContenidoPagina,
    MensajeGrupo,
};

