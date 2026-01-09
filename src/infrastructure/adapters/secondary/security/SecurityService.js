const { cifrarDato, descifrarDato } = require('../../../../application/controller/encrypDates');

/**
 * Service to handle data encryption and decryption.
 * Adapts the existing legacy functions to a standardized interface.
 */
class SecurityService {
    /**
     * Encrypts a string value.
     * @param {string} value 
     * @returns {string} Encrypted value
     */
    encrypt(value) {
        if (!value) return value;
        try {
            return cifrarDato(value);
        } catch (error) {
            console.error('Error encrypting data:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Decrypts a string value.
     * @param {string} value 
     * @returns {string} Decrypted value, or empty string if failed
     */
    decrypt(value) {
        if (!value) return '';
        try {
            return descifrarDato(value);
        } catch (error) {
            console.error('Error decrypting data:', error);
            return '';
        }
    }

    // Spanish aliases for backward compatibility
    cifrar(value) {
        return this.encrypt(value);
    }

    descifrar(value) {
        return this.decrypt(value);
    }
}

module.exports = SecurityService;
