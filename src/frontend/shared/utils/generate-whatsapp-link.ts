export function generateWhatsAppLink(phone: string, message: string): string {
  const onlyNumbers = phone.replace(/\D/g, "")
  const url = new URL(`https://api.whatsapp.com/send/?phone=${onlyNumbers}`)
  url.searchParams.set("text", message.normalize("NFC"))

  return url.toString()
}
