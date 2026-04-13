const bcrypt = require('bcryptjs');

async function testBcrypt() {
    try {
        const hash = await bcrypt.hash('password123', 10);
        console.log('Hash produced:', hash);
        const match = await bcrypt.compare('password123', hash);
        console.log('Match result:', match);
    } catch (err) {
        console.error('Bcrypt error:', err);
    }
}

testBcrypt();
