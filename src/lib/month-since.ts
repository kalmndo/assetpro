export default function monthsSince(createdAt: Date) {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();

  const yearsDifference = currentDate.getFullYear() - createdDate.getFullYear();
  const monthsDifference = currentDate.getMonth() - createdDate.getMonth();

  return yearsDifference * 12 + monthsDifference;
}
