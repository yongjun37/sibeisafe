import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { useState } from 'react';

import baseURL from "../config";
import { getItem } from "../utils/localStorage"

export default function DownloadForm({ filename, fileid, ...props}) {
	// State to control password input
	const [password, setPassword] = useState('');
	const [isDownloading, setIsDownloading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!password) {
			alert("Please enter a password.");
      		return;
		}

		setIsDownloading(true);

		try {
			const formData = new FormData();
			formData.append('password', password);

			const response = await fetch(`${baseURL}/download/${fileid}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				},
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				alert(`Download failed: ${errorData.error}`);
				return;
    	}

			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			
			setPassword('');
			props.onHide();

		} catch (error) {
			console.error("Network error:", error);
			return;

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