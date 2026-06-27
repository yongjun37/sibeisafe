import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert'

import baseURL from "../config";

import { useState } from 'react';
import { getItem } from "../utils/localStorage"
import { decrypt_file } from '../utils/crypto';

export default function DownloadForm({ filename, fileid, ...props}) {
	// State to control password input
	const [password, setPassword] = useState('');
	const [isDownloading, setIsDownloading] = useState(false);
	const [error, setError] = useState(null);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!password) {
			setError("Please enter the decryption password.");
      		return;
		}

		setIsDownloading(true);
		setError(null);

		try {
			const response = await fetch(`${baseURL}/download/${fileid}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				}
			});

			if (!response.ok) {
				const errorData = await response.json();
				setError(errorData.error);
				return;
    	}

			const encryptedBlob = await response.blob()
													 
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
			props.onHide();

		} catch (e) {
			if (e.name == 'OperationError' || e.name === 'InvalidAccessError') {
				console.error("Failed to decrypt file:", e);
				setError("Decryption failed. Please check your file or password and try again.");

			} else {
				console.error("Network error:", e);
				setError("An error occurred during download. Please try again.");
			}
			

		} finally { 
			setIsDownloading(false);
		}
		
	}

  return (
	
    <Modal // Modal popup for a download form
      {...props}
      onHide={() => {
        setPassword('');
        props.onHide();
				setError(null);
      }}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Download: {filename}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{error && <Alert variant="danger">{error}</Alert>}
					<Form.Label htmlFor="inputPassword">Password</Form.Label>
					<Form.Control
						type="password"
						id='inputPassword'
						aria-describedby="passwordHelpBlock"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isDownloading}
					/>
					<Form.Text id="passwordHelpBlock" muted>
						Enter the password you used to encrypt {filename}.
					</Form.Text>
				</Modal.Body>

				<Modal.Footer>
					<Button type='submit' disabled={isDownloading}>
						{isDownloading ? 'Decrypting...' : 'Decrypt and Download!'}
					</Button>
				</Modal.Footer>
			</Form>	
    </Modal>
		
  );
}