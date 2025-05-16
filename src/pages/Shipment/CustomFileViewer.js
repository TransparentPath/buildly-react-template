/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@mui/material';
import FormModal from '@components/Modal/FormModal';
import FileViewer from 'react-file-viewer';

const CustomFileViewer = ({ open, closeFileView, selectedFile }) => {
  const [fileURL, setFileURL] = useState(null);
  const isGoogleStorage = selectedFile?.link?.includes('storage.googleapis.com');

  useEffect(() => {
    let objectUrl;

    const createBlobURL = async () => {
      if (selectedFile instanceof File) {
        objectUrl = URL.createObjectURL(selectedFile);
        setFileURL(objectUrl);
      } else if (selectedFile?.link) {
        if (isGoogleStorage) {
          setFileURL(selectedFile.link);
          return;
        }
        try {
          const response = await fetch(selectedFile.link);
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setFileURL(objectUrl);
        } catch (err) {
          console.error('Error fetching file blob:', err);
        }
      }
    };

    createBlobURL();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  if (!selectedFile || !fileURL) return null;

  const fileName = selectedFile.name || selectedFile.file || 'File Viewer';
  const extension = fileName.split('.').pop()?.toLowerCase();

  const renderViewer = () => {
    if (!fileURL) return null;

    if (['pdf'].includes(extension)) {
      return (
        <iframe
          src={fileURL}
          title="PDF Viewer"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <img
          src={fileURL}
          alt={fileName}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      );
    }

    if (['csv', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension) && !isGoogleStorage) {
      return (
        <FileViewer
          fileType={extension}
          filePath={fileURL}
          onError={(e) => {
            console.error('FileViewer error:', e);
          }}
        />
      );
    }

    return (
      <div>
        <Typography variant="body1" textAlign="center">
          Preview not available for this file type.
        </Typography>
        <Typography variant="body1" textAlign="center">
          <Link
            color="primary"
            href={fileURL}
            download={fileName}
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Download
          </Link>
        </Typography>
      </div>
    );
  };

  return (
    <FormModal
      open={open}
      handleClose={closeFileView}
      title={fileName}
      openConfirmModal={false}
      maxWidth="lg"
      fullWidth
    >
      <div style={{ height: '70vh', overflow: 'auto' }}>
        {renderViewer()}
      </div>
    </FormModal>
  );
};

export default CustomFileViewer;
