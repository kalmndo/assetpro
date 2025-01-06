export default function notifDesc(
  name: string,
  title: string,
  no: string
) {
  return `<p class="text-sm font-semibold">${name}<span class="font-normal ml-[5px]">${title} ${no}</span></p>`;
}