class SubirArchivo {
    constructor(storageRepository) {
        this.storageRepository = storageRepository;
    }

    async execute(file, type) {
        if (!file) {
            throw new Error('No se recibió ningún archivo.');
        }

        // Validate type
        const validTypes = ['usuario', 'cliente', 'archivos'];
        if (!validTypes.includes(type)) {
            throw new Error('Tipo de archivo no válido.');
        }

        // Save
        const savedName = await this.storageRepository.save(file, type);
        return savedName;
    }
}

module.exports = SubirArchivo;
