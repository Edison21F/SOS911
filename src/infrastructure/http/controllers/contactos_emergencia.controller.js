const ContactoEmergencia = require('../../../domain/models/contactos_emergencia.model');
// const Usuario = require('../../../domain/models/usuarios.model'); // Si necesitáramos buscar usuarios

// Agregar un nuevo contacto
const createContact = async (req, res) => {
    try {
        const { idUsuarioSql, nombre, telefono, relacion } = req.body;

        // Verificar si ya existe este número para este usuario
        const existe = await ContactoEmergencia.findOne({ idUsuarioSql, telefono });
        if (existe) {
            return res.status(400).json({ error: 'El contacto ya existe' });
        }

        // Lógica de VINCULACIÓN:
        // Idealmente aquí buscaremos en la tabla de Usuarios si este teléfono ya está registrado.
        // Por ahora, lo dejaremos como PENDIENTE a menos que envíen el ID explícitamente.
        // TODO: Consultar servicio de usuarios para ver si 'telefono' pertenece a un usuario ID.

        const nuevoContacto = new ContactoEmergencia({
            idUsuarioSql,
            nombre,
            telefono,
            relacion,
            estado: 'PENDIENTE' // Por defecto
        });

        await nuevoContacto.save();
        res.status(201).json({ success: true, data: nuevoContacto });

    } catch (error) {
        console.error('Error creando contacto:', error);
        res.status(500).json({ error: 'Error al agregar contacto' });
    }
};

// Listar contactos de un usuario
const getContacts = async (req, res) => {
    try {
        const { idUsuarioSql } = req.params;
        const contactos = await ContactoEmergencia.find({ idUsuarioSql });
        res.json({ success: true, data: contactos });
    } catch (error) {
        console.error('Error obteniendo contactos:', error);
        res.status(500).json({ error: 'Error al obtener contactos' });
    }
};

// Eliminar contacto
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await ContactoEmergencia.findByIdAndDelete(id);
        res.json({ success: true, message: 'Contacto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar contacto' });
    }
};

module.exports = { createContact, getContacts, deleteContact };
