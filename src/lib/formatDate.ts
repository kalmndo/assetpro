export default function formatDate(dateString: Date) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const month = date.getMonth()
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    day,
    month,
    monthName,
    hours,
    minutes
  }
}