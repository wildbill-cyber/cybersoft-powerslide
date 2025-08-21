// Converts a File to a persistent data URL we can store in JSON
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result) // data:...base64
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
