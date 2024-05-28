import twilio from 'twilio'
const accountSid = 'AC5d57150f7fccd3be300da360ab59d443';
const authToken = '32db9d8891d848fb2afd79d00f276e1e';

const client = twilio(accountSid, authToken);

export default function sendWhatsAppMessage(to: string, message: string) {
  client.messages.create({
    body: message,
    from: 'whatsapp:+14155238886', // Your Twilio Sandbox Number
    to: `whatsapp:${to}`,
  });

}