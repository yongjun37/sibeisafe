import baseURL from '../config.js'
import { setItem, getItem } from '../utils/localStorage.js'

function Decrypt() {
  async function handleDecrypt(e) {
    e.preventDefault()

    const jwt_token = getItem('jwt_token');
    if (jwt_token == undefined) {
      alert("Invalid Token/Token does not exist")
      return;
    }

    // Fetch the decrypted file from the backend
    const response = await fetch(baseURL + '/decrypt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt_token}`
      },
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