import baseURL from './config.js'

function Decrypt() {
  async function handleDecrypt(e) {
    e.preventDefault()

    // Fetch the decrypted file from the backend
    const response = await fetch(baseURL + '/decrypt', {
      method: 'POST',
      body: new FormData(e.target)
    })

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json()
      alert(`Decryption failed: ${errorData.error}`)
      return
    }

    // Create a download link for the decrypted file
    const url = URL.createObjectURL(await response.blob())

    const link = document.createElement('a')
    link.href = url
    link.download = e.target.file.files[0].name + '-decrypted'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)

  }

  return (
    <>
      <form onSubmit={handleDecrypt}>
        <input type="file"
               name="file" />
        <input type="password" 
               name="password"
               placeholder="Enter password" />
        <button type="submit">Decrypt</button>
      </form>
    </>
  )
}

export default Decrypt