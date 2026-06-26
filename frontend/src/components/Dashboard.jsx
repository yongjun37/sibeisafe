import '../styles/App.css';

import { useEffect, useState } from "react"
import { getItem } from "../utils/localStorage"

import baseURL from "../config";
import DownloadForm from "./DownloadForm"
import UploadForm from "./UploadForm";
import FileListItem from './FileListItem';
import ShareModal from './ShareModal';


function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [sharedFile, setSharedFile] = useState(null);


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
      setFiles(data);

      return data;

    } catch (error) {

      // Log error in console
      console.error("Network error:", error);
      return [];

    } finally {
      setIsLoading(false);

    }
  }

  // Get the list of files upon initial render
  useEffect(() => {
    getFiles();
  }, [])


  return (
    <>
      <div className="d-flex">
        <h1 className="p-2 flex-grow-1">Dashboard</h1>
        {/* Show upload form upon button click */}
        <button className="p-2 btn btn-primary btn-sm align-self-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowUploadForm(true);
          }}>
          Upload
        </button>
      </div>

      { /* Show spinner while getFiles() is working, 
           if no files, return <p>, else return the list of files */}
      {isLoading
        ? (<div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>)
        : files.length === 0
          ? <p className="text-center text-muted mt-4">No existing files.</p>
          : <ul className="list-group shadow-sm">
            {files.map((file) =>
              <FileListItem
                key={file[0]}
                file={file}
                onDownload={setSelectedFile}
                onShare={setSharedFile}
                getFiles={getFiles}
              />)}
          </ul>
      }

      {/* Download Form Popup */}
      <DownloadForm
        show={selectedFile !== null}
        onHide={() => setSelectedFile(null)}
        filename={selectedFile ? selectedFile.name : ''}
        fileid={selectedFile ? selectedFile.id : ''}
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

      {/* Share Link Popup */}
      <ShareModal 
        show={sharedFile !== null}
        onHide={() => setSharedFile(null)}
        filename={sharedFile ? sharedFile.name : ''}
        fileid={sharedFile ? sharedFile.id : ''}
      />
    </>
  )
}

export default Dashboard