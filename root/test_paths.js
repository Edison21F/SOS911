try {
    console.log('Testing ../src/config/keys...');
    require('../src/config/keys');
    console.log('PASSED');
} catch (e) { console.error('FAILED keys:', e.message); }

try {
    console.log('Testing ../src/infrastructure/database/connection/dataBase.mongo...');
    require('../src/infrastructure/database/connection/dataBase.mongo');
    console.log('PASSED');
} catch (e) { console.error('FAILED mongo:', e.message); }

try {
    console.log('Testing ../src/infrastructure/database/connection/dataBase.sql...');
    require('../src/infrastructure/database/connection/dataBase.sql');
    console.log('PASSED');
} catch (e) { console.error('FAILED sql:', e.message); }

try {
    console.log('Testing ../src/infrastructure/database/connection/dataBase.orm...');
    require('../src/infrastructure/database/connection/dataBase.orm');
    console.log('PASSED');
} catch (e) { console.error('FAILED orm:', e.message); }

try {
    console.log('Testing ../src/infrastructure/lib/passport...');
    require('../src/infrastructure/lib/passport');
    console.log('PASSED');
} catch (e) { console.error('FAILED passport:', e.message); }

try {
    console.log('Testing ../src/infrastructure/http/router/index.router...');
    require('../src/infrastructure/http/router/index.router');
    console.log('PASSED');
} catch (e) { console.error('FAILED router:', e.message); }
