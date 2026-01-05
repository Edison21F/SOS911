class CheckRegistrationAvailability {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute() {
        // Business Rule: Registration is only open if NO users exist.
        // Once the first user (Admin) is created, public registration closes.
        const count = await this.usuarioRepository.countUsers();

        if (count === 0) {
            const maxId = await this.usuarioRepository.getMaxId();
            return { available: true, maxUserId: maxId };
        } else {
            return { available: false };
        }
    }
}

module.exports = CheckRegistrationAvailability;
