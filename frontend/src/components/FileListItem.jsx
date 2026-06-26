import { BsDownload, BsTrash, BsShare } from "react-icons/bs";
import Dropdown from 'react-bootstrap/Dropdown'

export default function FileListItem({ file, onDownload, onShare, getFiles }) {
	const id = file[0];
	const filename = file[1];
	const upload_time = file[2];

	// Delete file upon pressing delete button
	async function handleDelete(id, e) {
		e.stopPropagation();
		try {
			const response = await fetch(`${baseURL}/files/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				}
			});

			// Parse response
			const data = await response.json();

			// if HTTP code is not 2xx show error message
			if (!response.ok) {
				alert(`File fetch failed: ${data.error}`);
				return;
			}

			// Refresh UI
			getFiles();

			// Show success message
			alert(`Deletion Success: ${data.message}`);

		} catch (error) {
			// Log error in console
			console.error("Network error:", error);
			return;
		}
	}

	return (
		<li key={id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
			<div className="fw-bold flex-grow-1">
				{filename}
			</div>

			<div className="d-flex gap-2 align-items-center">
				<Dropdown>
					<Dropdown.Toggle className="caret-off meatball-btn bg-transparent border-0 text-secondary shadow-none fs-5" type='button'>
						&#8942;
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item
							onClick={(e) => {
								e.stopPropagation()
								onDownload({ id: id, name: filename })
							}}
						>
							<BsDownload className="me-2" />Download
						</Dropdown.Item>

						<Dropdown.Item
							onClick={(e) => {
								e.stopPropagation()
								onShare({ id: id, name: filename })
							}}
						>
							<BsShare className='me-2' />Share
						</Dropdown.Item>

						<Dropdown.Item
							onClick={(e) => handleDelete(id, e)}
						>
							<BsTrash className="me-2" />Delete
						</Dropdown.Item>

					</Dropdown.Menu>
				</Dropdown>
			</div>
		</li>
	)
}