function maskPhone(phone) {
    if (!phone) return '';
    // Keeps the country code and last 4 digits, masks the middle
    // Format assumed: +XX XXXXXXXXXX or similar
    if (phone.length <= 7) return '****' + phone.slice(-3);
    
    const visibleLength = 4;
    const prefix = phone.slice(0, phone.length - visibleLength);
    const suffix = phone.slice(-visibleLength);
    
    // Mask most of the prefix except maybe the starting '+' or first 2 chars
    const maskedPrefix = prefix.slice(0, 3) + '*'.repeat(prefix.length - 3);
    
    return maskedPrefix + suffix;
}

module.exports = { maskPhone };
