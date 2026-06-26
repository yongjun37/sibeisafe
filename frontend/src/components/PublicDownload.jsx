import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import baseURL from '../config';

export default function PublicDownload() {
  // 1. Extract the share_id directly from the URL bar
  const { share_id } = useParams();

  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload(e) {
    e.preventDefault();
    if (!password) {
      setError("Please enter the decryption password.");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('password', password);

      const response = await fetch(`${baseURL}/share/${share_id}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
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

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPassword('');

    } catch (error) {
      console.error("Download Error:", error);
      setError("A network error occurred while trying to securely download the file.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Secure File Transfer</h2>
            <p>You have been sent an encrypted file.</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleDownload}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Decryption Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter the password provided by the sender"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDownloading}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-bold"
              disabled={isDownloading}
            >
              {isDownloading ? 'Decrypting...' : 'Decrypt and Download'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}