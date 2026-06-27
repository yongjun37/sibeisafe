import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import baseURL from '../config';
import { getItem } from '../utils/localStorage';
import { encrypt_file } from '../utils/crypto';

export default function UploadForm( {onSuccess, ...props} ) {
	const [password, setPassword] = useState('');
	const [uploadFile, setUploadFile] = useState(null);

	async function handleUpload(e) {
		e.preventDefault();

		// Check for valid file and password
		if (!uploadFile || !password) {
      alert("Please select a file and enter a password.");
      return;
    }	

		try {
			const encryptedFile = await encrypt_file(uploadFile, password)

			// Make form data
			const formData = new FormData();
			formData.append('file', encryptedFile, uploadFile.name);

			// Upload files into S3
			const response = await fetch(`${baseURL}/upload`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				},
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				alert(`Upload Failed: ${data.error}`);
				return;
    	}
			
			// Refresh list of files and close the form
			onSuccess();

			// Show success message
			alert(data.message);

		} catch (e) {
			if (e.name == 'OperationError' || e.name === 'InvalidAccessError') {
				console.error("Failed to encrypt file:", e);
				alert("Encryption failed. Please check your file and try again.");
			}
			console.error("Network error:", e);
			alert("An error occurred during upload. Please try again.");

		} finally {
			// Reset the controlled variables
			setPassword('');
			setUploadFile(null);
		}
	}

  return (
    <Modal
      {...props}
			onHide={() => {
				props.onHide();
				setPassword('');
				setUploadFile(null);
			}}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
			<Form onSubmit={handleUpload}>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Upload File?
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
          <Form.Label htmlFor="inputFile">File</Form.Label>
					<Form.Control 
					  type="file"
						id='inputFile'
						onChange={(e) => setUploadFile(e.target.files[0])}
					/>
					<br/>
					<Form.Label htmlFor="inputPassword">Password</Form.Label>
					<Form.Control
						type="password"
						id='inputPassword'
						aria-describedby="passwordHelpBlock"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Form.Text id="passwordHelpBlock" muted>
						Please remember your password, it will be used to retrieve your file.
					</Form.Text>
				</Modal.Body>

				<Modal.Footer>
					<Button type='submit'>
						Encrypt and Upload!
					</Button>
				</Modal.Footer>
			</Form>	
    </Modal>
		
  );
}