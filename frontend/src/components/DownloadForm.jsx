import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

export default function DownloadForm({ filename, handleDownload, ...props}) {
	// State to control password input
	const [password, setPassword] = useState('');

	function handleSubmit(e) {
		e.preventDefault();

		// Check if user inputted password
		if (!password) {
			alert("Please enter a password.");
      		return;
		}

		// Call Dashboard's handleDownload
		handleDownload(password);

		//Reset password
		setPassword('');
	}

  return (
	
    <Modal // Modal popup for a download form
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Download {filename}?
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
					/>
					<Form.Text id="passwordHelpBlock" muted>
						Enter the password you used to encrypt {filename}.
					</Form.Text>
				</Modal.Body>

				<Modal.Footer>
					<Button type='submit'>
						Decrypt and Download!
					</Button>
				</Modal.Footer>
			</Form>	
    </Modal>
		
  );
}