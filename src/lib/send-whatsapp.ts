import twilio from 'twilio'
const accountSid = 'AC5d57150f7fccd3be300da360ab59d443';
const authToken = '32db9d8891d848fb2afd79d00f276e1e';

const client = twilio(accountSid, authToken);

export default async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Your Twilio Sandbox Number
      to: `whatsapp:${to}`,
    });
    console.log(`Message sent to ${to}: ${response.sid}`);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to send message: ${error}`);
  }
}