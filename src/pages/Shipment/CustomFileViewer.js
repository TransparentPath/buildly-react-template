/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import FormModal from '@components/Modal/FormModal';
import { Typography } from '@mui/material';
import { DocViewer, DocViewerRenderers } from '@cyntler/react-doc-viewer';

const CustomFileViewer = ({ open, closeFileView, selectedFile }) => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!selectedFile) return;

    let url;
    const fileName = selectedFile.name || selectedFile.file || 'Document';

    if (selectedFile instanceof File) {
      url = URL.createObjectURL(selectedFile);
      setDocs([{ uri: url, fileType: selectedFile.type, name: fileName }]);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (selectedFile?.link) {
      setDocs([{ uri: selectedFile.link, name: fileName }]);
    }
  }, [selectedFile]);

  if (!selectedFile || docs.length === 0) return null;

  return (
    <FormModal
      open={open}
      handleClose={closeFileView}
      title={selectedFile.name || selectedFile.file || 'File Viewer'}
      openConfirmModal={false}
      maxWidth="lg"
      fullWidth
    >
      <div style={{ height: '70vh', overflow: 'auto' }}>
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ height: '100%' }}
          config={{
            header: {
              disableHeader: true,
              disableFileName: false,
              retainURLParams: false,
            },
          }}
        />
      </div>
    </FormModal>
  );
};

export default CustomFileViewer;
