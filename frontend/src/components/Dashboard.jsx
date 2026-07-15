import '../styles/App.css';

import { useEffect, useState } from "react"
import { getItem } from "../utils/localStorage"
import { useOutletContext } from "react-router-dom";

import baseURL from "../config";
import DownloadForm from "./DownloadForm"
import UploadForm from "./UploadForm";
import FileListItem from './FileListItem';
import ShareModal from './ShareModal';


function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sharedFile, setSharedFile] = useState(null);

  const { files, isLoading, getFiles, setShowUploadForm } = useOutletContext();

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