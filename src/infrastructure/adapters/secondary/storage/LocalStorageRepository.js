const IStorageRepository = require('../../../../domain/repositories/IStorageRepository');
const path = require('path');
const fs = require('fs');

class LocalStorageRepository extends IStorageRepository {

    constructor() {
        super();
        // Base paths mapped to types
        this.paths = {
            'usuario': path.join(__dirname, '../../../../../../public/img/usuario'),
            'cliente': path.join(__dirname, '../../../../../../public/img/cliente'),
            'archivos': path.join(__dirname, '../../../../../../public/archivos/usuario') // Legacy path structure mapping
        };
    }

    async save(fileObject, destination) {
        if (!this.paths[destination]) {
            throw new Error(`Destino de archivo inválido: ${destination}`);
        }

        const targetDir = this.paths[destination];

        // Ensure dir exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = fileObject.name; // Keep original name? Or sanitize? Legacy kept original.
        const targetPath = path.join(targetDir, fileName);

        return new Promise((resolve, reject) => {
            fileObject.mv(targetPath, (err) => {
                if (err) reject(err);
                else resolve(fileName);
            });
        });
    }
}

module.exports = LocalStorageRepository;
