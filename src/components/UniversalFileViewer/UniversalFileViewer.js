/* eslint-disable no-console */
/**
 * @fileoverview Universal File Viewer Component
 * A React component that provides preview functionality for various file types including
 * images, videos, PDFs, office documents, and text files. Supports both local files
 * and files stored in Google Cloud Storage.
 */

import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormModal from '@components/Modal/FormModal';
import FileViewer from 'react-file-viewer';

/**
 * PropTypes for UniversalFileViewer
 * @typedef {Object} UniversalFileViewerProps
 * @property {boolean} open - Controls the visibility of the file viewer modal
 * @property {Function} closeFileView - Callback function to close the file viewer
 * @property {(File|Object)} selectedFile - The file to be displayed. Can be either a File object or
 *                                         an object containing file metadata with a 'link' property
 * @property {string} [selectedFile.link] - URL to the file (required if selectedFile is not a File object)
 * @property {string} [selectedFile.name] - Name of the file
 * @property {string} [selectedFile.file] - Alternative name property
 */

/**
 * Universal File Viewer Component
 * Renders different types of files in a modal window with appropriate viewers based on file type
 * @param {UniversalFileViewerProps} props - Component props
 * @returns {React.ReactElement|null} The rendered component or null if no file is selected
 */
const UniversalFileViewer = ({ open, closeFileView, selectedFile }) => {
  const { t } = useTranslation();
  const [fileURL, setFileURL] = useState(null);
  // Check if the file is stored in Google Cloud Storage
  const isGoogleStorage = selectedFile?.link?.includes('storage.googleapis.com');

  /**
   * Effect hook to handle file URL creation and cleanup
   * Creates blob URLs for File objects and sets direct URLs for linked files
   */
  useEffect(() => {
    let objectUrl;

    /**
     * Creates a blob URL for File objects or sets the direct URL for linked files
     * @async
     */
    const createBlobURL = async () => {
      if (selectedFile instanceof File) {
        // Create blob URL for local File objects
        objectUrl = URL.createObjectURL(selectedFile);
        setFileURL(objectUrl);
      } else if (selectedFile?.link) {
        if (isGoogleStorage) {
          // Use direct URL for Google Storage files
          setFileURL(selectedFile.link);
        }
      }
    };

    createBlobURL();

    // Cleanup function to revoke blob URLs when component unmounts or file changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  if (!selectedFile || !fileURL) return null;

  const fileName = selectedFile.name || selectedFile.file || t('fileViewer.defaultTitle');
  const extension = fileName.split('.').pop()?.toLowerCase();

  /**
   * Renders the appropriate viewer component based on file extension
   * @returns {React.ReactElement|null} The rendered viewer component or null if no URL
   */
  const renderViewer = () => {
    if (!fileURL) return null;

    // Text file viewer
    if (['txt'].includes(extension)) {
      return (
        <iframe
          src={fileURL}
          title={fileName}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    }

    // PDF viewer
    if (['pdf'].includes(extension)) {
      return (
        <iframe
          src={fileURL}
          title={fileName}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    }

    // Image viewer
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <img
          src={fileURL}
          alt={fileName}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      );
    }

    // Office document viewer
    if (['csv', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      const officeOnlineViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileURL)}`;
      return (
        <iframe
          src={officeOnlineViewerUrl}
          title={fileName}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    }

    // Video player
    if (['mp4', 'mov', 'webm'].includes(extension)) {
      return (
        <video
          src={fileURL}
          controls
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          <track kind="captions" src="" label="No captions" />
          {t('fileViewer.videoNotSupported')}
        </video>
      );
    }

    // Fallback for unsupported file types
    return (
      <div style={{ height: '100%', textAlign: 'center', paddingTop: '20%' }}>
        <Typography variant="body1" textAlign="center">
          {t('fileViewer.previewNotAvailable')}
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
            {t('fileViewer.download')}
          </Link>
        </Typography>
      </div>
    );
  };

  /**
   * Render the file viewer modal
   */
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

export default UniversalFileViewer;
