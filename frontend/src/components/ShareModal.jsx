import { use, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import baseURL from '../config';
import { getItem } from '../utils/localStorage';

export default function ShareModal({ filename, fileid, ...props }) {
	const [isLoading, setIsLoading] = useState(false);
	const [shareLink, setShareLink] = useState('');
	const [copySuccess, setCopySuccess] = useState('')


	async function getShareLink() {
		setIsLoading(true);

		try {
			const response = await fetch(`${baseURL}/files/${fileid}/share`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				}
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				alert(`Link generation failed: ${data.error}`);
				return;
    	}

			setShareLink(`https://sibeisafe.xyz/share/${data.share_id}`);

		} catch (error) {
			console.error("Network error:", error);
			return;

		} finally { 
			setIsLoading(false);

		}
	}


	async function handleStopSharing() {
		setIsLoading(true);

		try {
			const response = await fetch(`${baseURL}/files/${fileid}/share`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				}
			});
			
			if (!response.ok) {
				const data = await response.json();
				alert(`Link generation failed: ${data.error}`);
				return;
    	}

			setShareLink('');
			alert("link closed");
			props.onHide();

		} catch (error) {
			console.error("Network error:", error);
			return;

		} finally { 
			setIsLoading(false);

		}
	}


	function copyToClipboard() {
		navigator.clipboard.writeText(shareLink);
		setCopySuccess('Copied to clipboard!');
		setTimeout(() => setCopySuccess(''), 3000);
	}

	return (
		<Modal 
			{...props} 
			onHide={() => {
				setShareLink('');
				props.onHide();
			}}
			size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					Share: {filename}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				{!shareLink 
					? (<div className="text-center py-4">
							<p>
								Generate a secure, public link to share this file.
								The recipient will still need your decryption password to access the contents.
							</p>
							<Button
								variant="primary"
								onClick={getShareLink}
								disabled={isLoading}
							>
								{isLoading ? 'Processing...' : 'Generate Public Link'}
							</Button>
						</div>)
					
					: (<div>
							<Form.Label>PUBLIC LINK ACTIVE</Form.Label>

							<InputGroup>
								<Form.Control
									readOnly
									value={shareLink}
								/>
								<Button onClick={copyToClipboard}>
									Copy
								</Button>
							</InputGroup>

							<div>
								{copySuccess && <small>{copySuccess}</small>}
							</div>
						</div>
						)}
			</Modal.Body>

			<Modal.Footer>
				{shareLink 
					? (<Button variant="danger" onClick={handleStopSharing} disabled={isLoading}>
						  {isLoading ? 'Revoking...' : 'Stop Sharing (Kill Link)'}
						</Button>) 
					: <div/>
				}
			</Modal.Footer>
		</Modal>
	);
}