import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
// Context to get the current logged-in user
import { getUser } from '@context/User.context';
// Utility functions to check user roles
import { checkForAdmin, checkForGlobalAdmin } from '@utils/utilMethods';
// Sub-components for various admin panel settings
import OrganizationSettings from './components/OrganizationSettings';
import CustodianType from './components/CustodianType';
import GatewayType from './components/GatewayType';
import ItemType from './components/ItemType';
import OrganizationType from './components/OrganizationType';
import Product from './components/Product';
import ProductType from './components/ProductType';
import RecipientAddress from './components/RecipientAddress';
// Import shared styles for admin panel UI
import '../AdminPanelStyles.css';

/**
 * Configuration Component
 * Renders a configuration UI with expandable accordion panels
 * based on the user's role (Admin or Super Admin).
 */
const Configuration = (props) => {
  const { t } = useTranslation();
  // Determine if the current user is an Admin
  const isAdmin = checkForAdmin(getUser());
  // Determine if the current user is a Global Admin (Super Admin)
  const superAdmin = checkForGlobalAdmin(getUser());

  return (
    <div>
      {/* Admin Panel: Render limited settings only if the user is an Admin */}
      {isAdmin && (
        <div className="adminPanelRoot">
          {/* Accordion for Organization Settings */}
          <Accordion defaultExpanded className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="organization-setting-content"
              id="organization-setting-header"
            >
              <Typography variant="h5">{t('configuration.organizationSettings')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OrganizationSettings {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Accordion for Recipient Address settings */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="recipient-address-content"
              id="recipient-address-header"
            >
              <Typography variant="h5">{t('configuration.recipientAddress')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RecipientAddress {...props} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
      {/* Super Admin Panel: Render all configuration settings */}
      {superAdmin && (
        <div className="adminPanelRoot">
          {/* Organization Settings */}
          <Accordion defaultExpanded className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="organization-setting-content"
              id="organization-setting-header"
            >
              <Typography variant="h5">{t('configuration.organizationSettings')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OrganizationSettings {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Recipient Address */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="recipient-address-content"
              id="recipient-address-header"
            >
              <Typography variant="h5">{t('configuration.recipientAddress')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RecipientAddress {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Custodian Type */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="custodian-type-content"
              id="custodian-type-header"
            >
              <Typography variant="h5">{t('configuration.custodianType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CustodianType {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Gateway/Tracker Type */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="gateway-type-content"
              id="gateway-type-header"
            >
              <Typography variant="h5">{t('configuration.trackerType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <GatewayType {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Item Type */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="item-type-content"
              id="item-type-header"
            >
              <Typography variant="h5">{t('configuration.itemType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ItemType {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Organization Type */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="organization-type-content"
              id="organization-type-header"
            >
              <Typography variant="h5">{t('configuration.organizationType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OrganizationType {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Product */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="product-content"
              id="product-header"
            >
              <Typography variant="h5">{t('configuration.products')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Product {...props} />
            </AccordionDetails>
          </Accordion>
          {/* Product Type */}
          <Accordion className="adminPanelAccordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="product-type-content"
              id="product-type-header"
            >
              <Typography variant="h5">{t('configuration.productType')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ProductType {...props} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default Configuration;
