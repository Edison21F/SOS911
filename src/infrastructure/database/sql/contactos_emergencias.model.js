// Definición del modelo "contactos_emergencias" para Sequelize (ORM)
const contactosEmergencias = (sequelize, type) => {
    return sequelize.define('contactos_emergencias', {
        id: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'Campo único de contacto de emergencia del cliente'
        },
        nombre: type.STRING, 
        descripcion: type.TEXT,
        telefono: type.STRING,
        estado: type.STRING,
        fecha_creacion: type.STRING,
        fecha_modificacion: type.STRING,
        // CAMPOS PARA VINCULACIÓN DE USUARIOS
        idUsuarioContactoSql: {
            type: type.INTEGER,
            allowNull: true,
            comment: 'ID del usuario registrado en la tabla clientes (si existe vinculación)'
        },
        clienteId: {
            type: type.INTEGER,
            allowNull: false,
            comment: 'ID del cliente propietario del contacto'
        }
    }, {
        timestamps: false,
        comment: 'Tabla de contactos de emergencia para clientes'
    });
};

module.exports = contactosEmergencias;

