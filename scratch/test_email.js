const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    envVars[match[1].trim()] = val;
  }
});

const host = envVars.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(envVars.SMTP_PORT || '465');
const user = envVars.SMTP_USER;
const pass = envVars.SMTP_PASS;
const from = envVars.SMTP_FROM || `"Flowers For You" <${user}>`;

console.log('--- TEST DE CONFIGURACIÓN SMTP ---');
console.log('Host:', host);
console.log('Port:', port);
console.log('User:', user);
console.log('From:', from);
console.log('Pass length:', pass ? pass.length : 0);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error de conexión SMTP:', error.message);
  } else {
    console.log('✅ ¡CONEXIÓN SMTP EXITOSA! El servidor respondió 250 OK.');
    
    transporter.sendMail({
      from,
      to: user,
      subject: '🌸 Prueba de Correo Corporativo - Flowers For You',
      text: '¡Hola! Este es un correo de prueba de verificación del sistema de envíos de Flowers For You.',
      html: '<h1 style="color:#FF97A4;">🌸 Flowers For You LLC</h1><p>¡El sistema de correo corporativo está funcionando 100% perfecto!</p>'
    }, (sendErr, info) => {
      if (sendErr) {
        console.error('❌ Error enviando mensaje:', sendErr.message);
      } else {
        console.log('🎉 ¡CORREO ENVIADO CON ÉXITO! MessageId:', info.messageId);
      }
    });
  }
});
