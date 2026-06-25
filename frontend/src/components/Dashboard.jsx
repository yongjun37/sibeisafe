import '../styles/App.css';

import { useEffect, useState } from "react"
import { getItem } from "../utils/localStorage"
import { useResolvedPath } from "react-router-dom";

import baseURL from "../config";
import DownloadForm from "./DownloadForm"
import UploadForm from "./UploadForm";

import Dropdown from 'react-bootstrap/Dropdown';
import { BsDownload, BsTrash, BsShare } from "react-icons/bs";


function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);


  // Get list of user's files from API
  async function getFiles() {
    try {
      setIsLoading(true);
			// Get response from API
      const response = await fetch(`${baseURL}/files`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getItem('jwt_token')}`
        }
      });

			// Parse response
			const data = await response.json();

			// if HTTP code is not 2xx show error message
      if (!response.ok) {
        alert(`File fetch failed: ${data.error}`);
        return [];
      }

			// Update state variable
      setFiles(data)

			return data;

    } catch (error) {

      // Log error in console
			console.error("Network error:", error);
			return [];

    } finally {
        setIsLoading(false);

    }
  }

  // Delete file upon pressing delete button
	async function handleDelete(id, e){
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


  // Download the file upon download button press
	async function handleDownload(id, filename, password) {
		try {
			// Create new form data with password
			const formData = new FormData();
			formData.append('password', password);

			// Fetch the encrypted file from the backend
			const response = await fetch(`${baseURL}/download/${id}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getItem('jwt_token')}`
				},
				body: formData
			})

			// Check if response is good
			if (!response.ok) {
				const errorData = await response.json();
				alert(`Download failed: ${errorData.error}`);
				return;
    	}

			// Create a download link for the encrypted file
			const url = URL.createObjectURL(await response.blob())

      // Create temp element
			const link = document.createElement('a')
			link.href = url
			link.download = filename

      // Download file using temp link element
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			
      // Remove temp element
			URL.revokeObjectURL(url)

      // Return success message
			alert('Download success')

		} catch (error) {
      // Log error in console
			console.error("Network error:", error);
			return;
		}
	}

  // Return a <li> of a file with the download and delete buttons
	function displayFiles(file) {
		const id = file[0];
		const filename = file[1];
		const upload_time = file[2];

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
										setSelectedFile({ id: id, name: filename })
									}}
							>
								<BsDownload className="me-2" />Download
							</Dropdown.Item>
							<Dropdown.Item 
								onClick={() => alert("share")}
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

  // Get the list of files upon initial render
  useEffect(() => {
    getFiles()
  }, [])


  return (
    <>
			<div className="d-flex">
				<h1 className="p-2 flex-grow-1">Dashboard</h1>
        {/* Show upload form upon button click */}
				<button className="p-2 btn btn-primary btn-sm align-self-center"
				        onClick={(e) => {
										e.stopPropagation()
										setShowUploadForm(true)
								}}>
					Upload
				</button>
			</div>
      
			{ // Show spinner while getFiles() is working, 
        // if no files, return <p>, else return the list of files
        isLoading 
					? (<div className="d-flex justify-content-center mt-5">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>)
					: files.length === 0
						? <p className="text-center text-muted mt-4">No existing files.</p>
						: <ul className="list-group shadow-sm">
								{files.map((f) => displayFiles(f))}
							</ul>
			}

			{/* Download Form Popup */}
			<DownloadForm
				show={selectedFile !== null}
				onHide={() => setSelectedFile(null)}
				filename={selectedFile ? selectedFile.name : ''}
				handleDownload={(password) => {
						handleDownload(selectedFile.id, selectedFile.name, password);
						setSelectedFile(null);
					}}
			/>

			{/* Upload Form Popup */}
			<UploadForm
				show={showUploadForm}
				onHide={() => setShowUploadForm(false)}
				onSuccess={() => {
					getFiles();
					setShowUploadForm(false);
				}}
			/>
    </>
  )
}

export default Dashboard