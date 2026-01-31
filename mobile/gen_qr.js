const QRCode = require('qrcode');
const fs = require('fs');

const url = 'exp://10.104.25.169:8081';

QRCode.toFile('qrcode.png', url, {
    color: {
        dark: '#000000',  // Blue dots
        light: '#FFFFFF' // Transparent background
    },
    width: 500
}, function (err) {
    if (err) throw err;
    console.log('QR code saved!');
});
