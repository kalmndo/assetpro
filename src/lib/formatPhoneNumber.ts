export default function formatPhoneNumber(phoneNumber: string) {
  if (phoneNumber.startsWith('0')) {
    return '+62' + phoneNumber.slice(1);
  } else {
    return phoneNumber; // Or handle other cases as needed
  }
}