const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
app.use(cookieParser());
// CSRF middleware is usually applied at App level, here it was applied locally?
// The legacy code used: app.use(csrf({ cookie: true }));
// But this file exports an object 'guardadoImgenCtl', it doesn't seem to use the 'app' instance created here for anything other than imports?
// It seems the legacy file had unused code at the top. I will focus on the controller functions.

const LocalStorageRepository = require('../../adapters/secondary/storage/LocalStorageRepository');
const SubirArchivo = require('../../../application/use-cases/common/SubirArchivo');

const storageRepository = new LocalStorageRepository();
const subirArchivoUseCase = new SubirArchivo(storageRepository);

const guardadoImgenCtl = {};

// Helper wrapper
async function handleUpload(req, res, type) {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).send('No se recibió ningún archivo');
        }

        await subirArchivoUseCase.execute(req.files.image, type);
        res.send('Imagen guardada exitosamente!');
    } catch (error) {
        console.error(`Error subiendo archivo (${type}):`, error.message);
        res.status(500).send('Error al guardar la imagen');
    }
}

// SendUsuario
guardadoImgenCtl.sendUsuario = async (req, res) => handleUpload(req, res, 'usuario');

// sendArchivos 
guardadoImgenCtl.sendArchivos = async (req, res) => handleUpload(req, res, 'archivos');

// sendCliente
guardadoImgenCtl.sendCliente = async (req, res) => handleUpload(req, res, 'cliente');

module.exports = guardadoImgenCtl;
