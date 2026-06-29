import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { decrypt_file } from '../utils/crypto';
import { Alert } from 'react-bootstrap';

import baseURL from '../config';

export default function PublicDownload() {
  const { share_id } = useParams();
  const errorTimerRef = useRef(null);

  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const displayError = (msg) => {
    setError(msg);
    // If a timer is already running, kill it immediately
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    // Start a brand new 10-second timer
    errorTimerRef.current = setTimeout(() => {
      setError(null);
    }, 10000);
  };

  async function handleDownload(e) {
    e.preventDefault();

    if (!password) {
      displayError("Please enter the decryption password.");
      return;
    }

    setIsDownloading(true);
    displayError(null);

    try {
      const response = await fetch(`${baseURL}/share/${share_id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        displayError(errorData.error);
        return;
      }

      // Extract the filename from the Content-Disposition header
      const header = response.headers.get('Content-Disposition');
      let filename = 'secure_download';
      if (header && header.includes('filename=')) {
        const cleanheader = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(header);
        if (cleanheader != null && cleanheader[1]) { 
          filename = cleanheader[1].replace(/['"]/g, '');
        }
      }

      const encryptedBlob = await response.blob();

      const file = await decrypt_file(encryptedBlob, password);

      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPassword('');

    } catch (e) {
      if (e.name == 'OperationError' || e.name === 'InvalidAccessError') {
				console.error("Failed to decrypt file:", e);
				displayError("Decryption failed. Please check your file or password and try again.");

			} else {
        console.error("Network error:", e);
			  displayError("An error occurred during download. Please try again.");
      }

    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="card border-0 rounded-4 shadow bg-white p-5 d-flex flex-column justify-content-start">
      <h2 className="fw-bolder text-center">Secure File Transfer</h2>
      <p className="text-muted text-center">You have been sent an encrypted file.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <form onSubmit={handleDownload} className="d-flex flex-column gap-3">
        <div className="d-flex flex-column mb-3 mt-4">
          <label className="fw-bold fs-6 mb-1 text-dark">Password:</label>
          <input 
            type="password" 
            className="form-control"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            disabled={isDownloading}
            required 
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn w-100 py-2 mt-2 fw-bold"
          disabled={isDownloading}>
          {isDownloading ? 'Decrypting File...' : 'Download File'}
        </button>
      </form>
    </div>
  );
}