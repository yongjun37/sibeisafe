import baseURL from './config.js'

function Encrypt() {
  async function handleEncrypt(e) {
    e.preventDefault()

    // Fetch the encrypted file from the backend
    const response = await fetch(baseURL + '/encrypt', {
      method: 'POST',
      body: new FormData(e.target)
    })

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json()
      alert(`Encryption failed: ${errorData.error}`)
      return
    }

    // Create a download link for the encrypted file
    const url = URL.createObjectURL(await response.blob())

    const link = document.createElement('a')
    link.href = url
    link.download = e.target.file.files[0].name + '.enc'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)

  }

  return (
    <>
      <form onSubmit={handleEncrypt}>
        <input type="file"
               name="file" />
        <input type="password" 
               name="password"
               placeholder="Enter password" />
        <button type="submit">Encrypt</button>
      </form>
    </>
  )
}

export default Encrypt
