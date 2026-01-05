/**
 * Interface for Storage (File Uploads).
 */
class IStorageRepository {
    /**
     * Save a file to storage.
     * @param {Object} fileObject - The file object from express-fileupload or similar
     * @param {string} destination - 'usuario' | 'cliente' | 'archivos'
     * @returns {Promise<string>} Saved filename
     */
    async save(fileObject, destination) { throw new Error('Method not implemented'); }
}

module.exports = IStorageRepository;
