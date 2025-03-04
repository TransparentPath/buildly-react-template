import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import './TextAnimation.css';

const TextAnimation = () => {
  const [close, setClose] = useState(false);

  return (
    <div className={close ? 'textAnimationHidden' : 'textAnimationDiv'}>
      <span className="textAnimationText">
        Our website will be undergoing scheduled  maintenance from GMT 07:00 am Friday, 7th March until GMT 06:00 pm Sunday, 9th March.
        During this period, you may experience temporary disruptions.
        We apologize for any inconvenience and appreciate your patience as we work to improve our services.
        Thank you for your understanding.
        If you have any questions or need assistance, please contact us at support@transparentpath.com.
      </span>
      <IconButton onClick={() => setClose(true)}>
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default TextAnimation;
