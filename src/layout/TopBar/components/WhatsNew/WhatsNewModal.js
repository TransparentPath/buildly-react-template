import React from 'react';
import _ from 'lodash';
import { Dialog, DialogContent } from '@mui/material';
import '../../TopBarStyles.css';
import WhatsNewHeader from './WhatsNewHeader';
import WhatsNewContent from './WhatsNewContent';
import WhatsNewFooter from './WhatsNewFooter';

export default function WhatsNewModal({ open, setOpen }) {
  const closeWhatsNew = () => {
    setOpen(false);
    window.sessionStorage.setItem('isWhatsNewShown', true);
  };

  return (
    <Dialog
      open={open}
      onClose={closeWhatsNew}
      fullWidth
      fullScreen={false}
      aria-labelledby="whats-new"
    >
      <WhatsNewHeader />
      <DialogContent className="whatsNewDialogContent">
        <WhatsNewContent />
        <WhatsNewFooter buttonClick={closeWhatsNew} />
      </DialogContent>
    </Dialog>
  );
}
