/* eslint-disable no-plusplus */
/* eslint-disable new-cap */
/* eslint-disable no-console */
/* eslint-disable no-confusing-arrow */

/**
 * @file Invoices.jsx
 * @description Monthly invoice component that displays WhatsApp message charges and
 * shipping costs for a selected organization and month. Allows administrators to
 * view and edit shipping costs and generate PDF invoices.
 */

// React and library imports
import React, { useEffect, useState, useRef } from 'react';
import { Route } from 'react-router-dom';
import { useQuery } from 'react-query';
import _, { update } from 'lodash';
import moment from 'moment-timezone';

// MUI components
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

// Icons
import {
  Login as LoginIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  AttachMoney as DollarIcon,
} from '@mui/icons-material';

// Custom imports
import { getUser } from '@context/User.context';
import './InvoicesStyles.css';
import OrganizationSelector from '@components/OrganizationSelector/OrganizationSelector';
import { MONTHS } from '@utils/mock';
import { useInput } from '@hooks/useInput';
import useAlert from '@hooks/useAlert';
import { getAllOrganizationQuery } from '@react-query/queries/authUser/getAllOrganizationQuery';
import Loader from '@components/Loader/Loader';
import { checkForGlobalAdmin } from '@utils/utilMethods';
import { useWhatsappChargesMutation } from '@react-query/mutations/notifications/whatsappChargesMutation';
import { getTrackerOrderQuery } from '@react-query/queries/trackerorder/getTrackerOrderQuery';
import { useEditTrackerOrderMutation } from '@react-query/mutations/trackerorder/editTrackerOrderMutation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';

/**
 * Invoices Component
 *
 * Displays monthly WhatsApp charges and shipment costs for organizations.
 * Allows admin users to view detailed message counts, edit shipping costs,
 * and generate PDF invoices for selected months.
 *
 * @returns {JSX.Element} The Invoices component UI
 */
const Invoices = () => {
  /**
   * Gets the currently logged-in user's data including organization info
   * @type {Object} User information including role and organization
   */
  const user = getUser();

  const { t } = useTranslation();

  /**
   * Organization UUID for the current user, used for API queries
   * @type {string} UUID of the user's organization
   */
  const org_uuid = user.organization.organization_uuid;

  /**
   * Flag indicating if the current user has super admin privileges
   * @type {boolean} True if user is a global/super admin
   */
  const isSuperAdmin = checkForGlobalAdmin(user);

  /**
   * Currently selected organization name
   * @type {string} Name of the selected organization
   */
  const [organization, setOrganization] = useState(user.organization.name);

  /**
   * Controls the open/closed state of the main menu
   * @type {boolean} True if the main menu is open
   */
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  /**
   * Reference to the submenu anchor element for positioning
   * @type {HTMLElement|null} Element to anchor the submenu to
   */
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);

  /**
   * First day of the selected month (for filtering data)
   * @type {string} ISO date string of the first day of selected month
   */
  const [selectedMonthFirstDate, setSelectedMonthFirstDate] = useState();

  /**
   * First day of the month after the selected month (for range filtering)
   * @type {string} ISO date string of the first day of next month
   */
  const [nextMonthFirstDate, setNextMonthFirstDate] = useState();

  /**
   * Tracker orders data filtered by the selected month
   * @type {Array} Array of tracker order objects for the selected month
   */
  const [ordersData, setOrdersData] = useState([]);

  /**
   * Tracks which field is being edited and at which index
   * @type {Object} Contains field name and index of item being edited
   */
  const [isEditing, setIsEditing] = useState({ field: null, index: null });

  /**
   * Flag indicating if PDF generation is in progress
   * @type {boolean} True if PDF is being generated
   */
  const [generatingPdf, setGeneratingPdf] = useState(false);

  /**
   * Form data for editable fields (currently only shipping cost)
   * @type {Object} Form field values
   */
  const [formData, setFormData] = useState({ shippingCost: '' });

  /**
   * Currently selected year for invoice filtering
   * @type {string} Selected year (e.g., '2023')
   */
  const [selectYear, setSelectYear] = useState('');

  /**
   * Currently selected month for invoice filtering
   * @type {string} Selected month value (e.g., '01' for January)
   */
  const [selectMonth, setSelectMonth] = useState('');

  /**
   * List of years available for selection (based on org creation date)
   * @type {Array} Array of years as numbers
   */
  const [availableYears, setAvailableYears] = useState([]);

  /**
   * List of months available for selection (based on selected year)
   * @type {Array} Array of month objects with label and value
   */
  const [availableMonths, setAvailableMonths] = useState([]);

  /**
   * Total cost calculation including WhatsApp messages and shipping
   * @type {number} Total cost with 2 decimal places
   */
  const [totalCost, setTotalCost] = useState(0);

  /**
   * Reference to the invoice details container for PDF generation
   * Used to capture the container as an image for the PDF
   * @type {React.RefObject}
   */
  const invoicesDetailsRef = useRef();

  /**
   * Alert hook for displaying notifications to the user
   * @type {Object} Contains displayAlert function
   */
  const { displayAlert } = useAlert();

  /**
   * Query to fetch all organizations data
   * Used for organization selection dropdown and creation date info
   */
  const { data: orgData, isLoading: isLoadingOrgs } = useQuery(
    ['organizations'],
    () => getAllOrganizationQuery(displayAlert, 'Invoices'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Query to fetch tracker orders for the selected organization
   * These orders will be filtered by date in useEffect
   */
  const { data: trackerOrderData, isLoading: isLoadingTrackerOrder } = useQuery(
    ['trackerOrders', org_uuid],
    () => getTrackerOrderQuery(org_uuid, displayAlert, 'Invoices'),
    { refetchOnWindowFocus: false },
  );

  /**
   * Mutation to fetch WhatsApp message charges for the selected period
   * Called when user selects organization, year and month and clicks OK
   */
  const {
    data: whatsappChargesData,
    mutate: whatsappChargesMutation,
    isLoading: isWhatsappChargesLoading,
  } = useWhatsappChargesMutation(displayAlert, 'Invoices');

  /**
   * Mutation to edit tracker order details (e.g., shipping cost)
   * Called when admin user saves edited shipping cost for an order
   */
  const {
    mutate: editTrackerOrderMutation,
    isLoading: isTrackerOrderEditing,
  } = useEditTrackerOrderMutation(org_uuid, displayAlert, 'Invoices');

  /**
   * Populate available years for selection based on organization creation date
   * Years range from the organization's creation year to the current year
   */
  useEffect(() => {
    const creationDate = moment(_.find(orgData, { name: organization })?.create_date);
    const currentYear = moment().year();
    const years = [];
    for (let year = creationDate.year(); year <= currentYear; year++) {
      years.push(year);
    }
    setAvailableYears(years);
  }, [organization, orgData]);

  /**
   * Update available months based on selected year and org creation date
   * Months are filtered based on:
   * 1. If it's creation year - only show months from creation month onwards
   * 2. If it's current year - only show months up to current month
   * 3. Otherwise show all months
   */
  useEffect(() => {
    if (selectYear) {
      const creationDate = moment(_.find(orgData, { name: organization })?.create_date);
      const currentYear = moment().year();
      const currentMonth = moment().month();
      const isCreationYear = parseInt(selectYear, 10) === creationDate.year();
      const isCurrentYear = parseInt(selectYear, 10) === currentYear;
      const months = [];

      MONTHS.forEach((mth, index) => {
        if (isCreationYear && !isCurrentYear && index >= creationDate.month()) {
          months.push(mth);
        } else if (isCreationYear && isCurrentYear && index >= creationDate.month() && index <= currentMonth) {
          months.push(mth);
        } else if (!isCreationYear && isCurrentYear && index <= currentMonth) {
          months.push(mth);
        } else if (!isCreationYear && !isCurrentYear) {
          months.push(mth);
        }
      });
      setAvailableMonths(months);
    } else {
      setAvailableMonths([]);
    }
  }, [selectYear, organization, orgData]);

  /**
   * Filter tracker orders by selected month
   * Orders are filtered to only include those within the selected month's date range
   */
  useEffect(() => {
    if (!_.isEmpty(trackerOrderData) && !_.isEmpty(selectedMonthFirstDate) && !_.isEmpty(nextMonthFirstDate)) {
      const filteredOrders = trackerOrderData.filter((order) => {
        const orderDate = moment(order.order_date);
        const startDate = moment(selectedMonthFirstDate);
        const endDate = moment(nextMonthFirstDate);
        return orderDate.isBetween(startDate, endDate, undefined, '[)');
      });
      setOrdersData(filteredOrders);
    }
  }, [trackerOrderData, selectedMonthFirstDate, nextMonthFirstDate]);

  /**
   * Calculate total cost when WhatsApp data or orders data changes
   * Total includes WhatsApp message costs and shipping costs
   */
  useEffect(() => {
    let cost = 0;
    if (!_.isEmpty(whatsappChargesData)) {
      // Add WhatsApp message costs (message count * cost per message)
      cost += (whatsappChargesData.total_whatsapp_messages * window.env.WHATSAPP_MSG_COST);
    }
    if (!_.isEmpty(ordersData)) {
      // Add shipping costs from all orders
      ordersData.forEach((item) => {
        cost += item.shipping_cost;
      });
    }
    setTotalCost(cost.toFixed(2));
  }, [whatsappChargesData, ordersData]);

  /**
   * Handle organization change in dropdown
   * Updates the selected organization and closes menus
   *
   * @param {Object|string} e - Event object or organization name string
   */
  const handleOrganizationChange = (e) => {
    const organization_name = e.target ? e.target.value : e;
    if (!_.isEqual(organization, organization_name)) {
      setOrganization(organization_name);
    }
    setMainMenuOpen(false);
    setSubmenuAnchorEl(null);
  };

  /**
   * Handle year selection change
   * Updates selected year and resets month selection
   *
   * @param {Object} event - Change event from year dropdown
   */
  const handleYearChange = (event) => {
    setSelectYear(event.target.value ? (parseInt(event.target.value, 10).toString()) : '');
    setSelectMonth('');
  };

  /**
   * Handle month selection change
   * Updates selected month
   *
   * @param {Object} event - Change event from month dropdown
   */
  const handleMonthChange = (event) => {
    setSelectMonth(event.target.value);
  };

  /**
   * Capture screenshot of a React ref element
   * Used for PDF generation of invoice details
   *
   * @param {React.RefObject} ref - Reference to element to capture
   * @returns {Promise<string|null>} Base64 data URL of the screenshot or null
   */
  const captureScreenshot = async (ref) => {
    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          useCORS: true,
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing screenshot:', error);
      }
    }
    return null;
  };

  /**
   * Generate PDF of the invoice details
   * Captures screenshot of invoice section and creates downloadable PDF
   *
   * @param {Event} event - Click event object
   */
  const generatePdfInvoice = async (event) => {
    event.preventDefault();
    setGeneratingPdf(true);
    const base64DataArray = [];
    try {
      const dataUrl = await captureScreenshot(invoicesDetailsRef);
      if (dataUrl) {
        // Create PDF document
        const pdf = new jsPDF();
        const padding = 5;
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 10;
        const pdfHeight = pdfWidth - ((imgProps.height * pdfWidth) / imgProps.width);

        // Add the image to PDF and save with organization and month in filename
        pdf.addImage(dataUrl, 'PNG', padding, padding, pdfWidth, pdfHeight);
        pdf.save(`${_.toLower(organization)}_${_.toLower(selectMonth)}_invoice.pdf`);
      }
      setGeneratingPdf(false);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Handle form submission to fetch WhatsApp charges
   * Gets data for selected organization and month range
   */
  const handleSubmit = () => {
    // Get organization UUID either from super admin or regular admin context
    const adminOrgs = JSON.parse(localStorage.getItem('adminOrgs'));
    const { organization_uuid } = isSuperAdmin
      ? _.filter(orgData, (org) => _.isEqual(org.name, organization))[0]
      : _.filter(adminOrgs, (org) => _.isEqual(org.name, organization))[0];

    // Calculate first day of selected month and first day of next month for date range
    const year = moment().year();
    const paddedMonth = String(selectMonth).padStart(2, '0');
    const firstDateOfSelectedMonth = moment(`${year}-${paddedMonth}-01`, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD');
    const firstDateOfNextMonth = moment(`${year}-${paddedMonth}-01`, 'YYYY-MM-DD').add(1, 'month').startOf('month').format('YYYY-MM-DD');

    // Prepare data for API call
    const chargesData = {
      organization_uuid,
      start_date: `${firstDateOfSelectedMonth}T00:00:00.000000Z`,
      end_date: `${firstDateOfNextMonth}T00:00:00.000000Z`,
    };

    // Set date range for filtering tracker orders
    setSelectedMonthFirstDate(`${firstDateOfSelectedMonth}T00:00:00.000000Z`);
    setNextMonthFirstDate(`${firstDateOfNextMonth}T00:00:00.000000Z`);

    // Call API to fetch WhatsApp charges
    whatsappChargesMutation(chargesData);
  };

  /**
   * Handle editing of shipping cost
   * Toggles edit mode and saves changes when confirmed
   *
   * @param {string} field - Field name being edited (e.g., 'shippingCost')
   * @param {number} index - Index of the order in the ordersData array
   * @param {string|number} id - ID of the tracker order
   */
  const handleEditClick = (field, index, id) => {
    if (isEditing.field === field && isEditing.index === index) {
      // Save changes
      const updatedData = {
        id,
      };
      if (isEditing.field === 'shippingCost') {
        updatedData.shipping_cost = formData[field] ? parseInt(formData[field], 10) : 0;
      }
      // Call API to update tracker order
      editTrackerOrderMutation(updatedData);

      // Exit edit mode
      setIsEditing({ field: null, index: null });
      setFormData({ shippingCost: '' });
    } else {
      // Enter edit mode for this field/index
      setIsEditing({ field, index });
    }
  };

  /**
   * Handle form input changes
   * Updates the form data state with new input values
   *
   * @param {Object} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================================================================
  // Component Rendering
  // =========================================================================

  return (
    <div>
      {/* Loading indicator displayed during any async operation */}
      {(isLoadingOrgs
        || isLoadingTrackerOrder
        || isWhatsappChargesLoading
        || isTrackerOrderEditing
        || generatingPdf)
        && (
          <Loader open={isLoadingOrgs
            || isLoadingTrackerOrder
            || isWhatsappChargesLoading
            || isTrackerOrderEditing
            || generatingPdf}
          />
        )}

      <Grid container>
        {/* Title section with heading and PDF download icon */}
        <Grid item xs={12} sm={4} className="invoiceContainer">
          <Typography className="invoiceHeading" variant="h4">
            Monthly Invoice
          </Typography>
          <Tooltip placement="bottom" title={t('download_pdf')}>
            <LoginIcon className="invoiceDownloadIcon" onClick={generatePdfInvoice} />
          </Tooltip>
        </Grid>

        {/* Filters section with organization, year and month selectors */}
        <Grid item xs={12} sm={8} className="invoiceContainer invoiceContainer2">
          {/* Organization selector dropdown component */}
          <OrganizationSelector
            handleOrganizationChange={handleOrganizationChange}
            selectedOrg={organization}
            mainMenuOpen={mainMenuOpen}
            setMainMenuOpen={setMainMenuOpen}
            submenuAnchorEl={submenuAnchorEl}
            setSubmenuAnchorEl={setSubmenuAnchorEl}
          />

          {/* Year selection dropdown */}
          <TextField
            className={_.isEmpty(selectYear) ? 'invoiceMonths' : 'invoiceMonthsValue'}
            variant="outlined"
            id="year"
            select
            value={selectYear}
            onChange={handleYearChange}
            label="Year"
            disabled={!organization}
          >
            <MenuItem value="">
              <span className="notranslate">{t('select_year')}</span>
            </MenuItem>
            {availableYears.map((item, index) => (
              <MenuItem key={`year${index}`} value={item}>{item}</MenuItem>
            ))}
          </TextField>

          {/* Month selection dropdown */}
          <TextField
            className={_.isEmpty(selectMonth) ? 'invoiceMonths' : 'invoiceMonthsValue'}
            variant="outlined"
            id="month"
            select
            label="Month"
            value={selectMonth}
            onChange={handleMonthChange}
            disabled={!selectYear}
          >
            <MenuItem value="">
              <span className="notranslate">{t('select_month')}</span>
            </MenuItem>
            {availableMonths.map((item, index) => (
              <MenuItem key={`month${index}`} value={item.value}>
                <span className="notranslate">{t(item.label)}</span>
              </MenuItem>
            ))}
          </TextField>

          {/* Submit button to fetch data for selected filters */}
          <Button
            type="button"
            variant="contained"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '4px', height: '38px' }}
            disabled={!selectMonth || !selectYear}
            onClick={handleSubmit}
          >
            OK
          </Button>
        </Grid>
      </Grid>

      {/* Invoice details section - only shown when data is available */}
      {!_.isEmpty(whatsappChargesData)
        ? (
          <Grid container className="invoiceDetailsContainer" ref={invoicesDetailsRef}>
            <Typography className="invoiceDetailsHeader">Charges & Shipments</Typography>

            {/* Left side - Charges section */}
            <Grid item xs={12} sm={5.98} className="invoiceChargesContainer">
              <Grid container>
                {/* Email alerts summary */}
                <Grid item xs={7}>
                  <Typography className="invoiceChargesTitle">{`Email Alerts: ${whatsappChargesData.total_alerts_count}`}</Typography>
                  {!_.isEmpty(whatsappChargesData.detailed_email_messages) && whatsappChargesData.detailed_email_messages.map((item, index) => (
                    <Typography key={index} className="invoiceMsgText">{`${item.user} - ${item.message_count}`}</Typography>
                  ))}
                </Grid>

                {/* WhatsApp alerts summary */}
                <Grid item xs={5}>
                  <Typography className="invoiceChargesTitle">{`Whatsapp Alerts: ${whatsappChargesData.total_whatsapp_messages}`}</Typography>
                  {!_.isEmpty(whatsappChargesData.detailed_whatsapp_messages) && whatsappChargesData.detailed_whatsapp_messages.map((item, index) => (
                    <Typography key={index} className="invoiceMsgText">{`${item.user} - ${item.message_count}`}</Typography>
                  ))}
                </Grid>
              </Grid>

              {/* Device orders list with editable shipping costs */}
              <div className="invoiceOrderListContainer">
                {!_.isEmpty(ordersData) ? ordersData.map((item, index) => (
                  <div key={index} className="invoiceOrderListItemContainer">
                    <Typography className="invoiceChargesTitle">Device Order: YES</Typography>
                    <Typography className="invoiceMsgText">
                      {`${moment(item.order_date).format('DD/MM/YYYY')} - ${item.order_quantity.map((quantity, i) => (
                        `${quantity} ${item.order_type && item.order_type[i] ? item.order_type[i] : ''}`
                      )).join(', ')}`}
                    </Typography>

                    {/* Shipping fees with inline editing capability */}
                    <div className="invoiceOrderListItemSubContainer">
                      <Typography className="invoiceMsgText">Shipping Fees:</Typography>
                      {isEditing.field === 'shippingCost' && isEditing.index === index ? (
                        // Edit mode - show input field
                        <TextField
                          className="invoiceTextInput"
                          value={formData.shippingCost}
                          name="shippingCost"
                          onChange={handleInputChange}
                          size="small"
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><DollarIcon style={{ width: '15px', height: '15px' }} /></InputAdornment>,
                          }}
                        />
                      ) : (
                        // Display mode - show text value
                        <Typography ml={1} className="invoiceMsgText notranslate">{`$${item.shipping_cost}`}</Typography>
                      )}

                      {/* Edit/Save button */}
                      <IconButton onClick={() => handleEditClick('shippingCost', index, item.id)}>
                        {isEditing.field === 'shippingCost' && isEditing.index === index ? (
                          <CheckIcon className="invoiceEditIcon" />
                        ) : (
                          <EditIcon className="invoiceEditIcon" />
                        )}
                      </IconButton>
                    </div>
                  </div>
                )) : <Typography className="invoiceOrderDataEmptyText">No orders are available</Typography>}
              </div>

              {/* Total charges summary */}
              <Grid container mb={2}>
                <Grid item xs={7} />
                <Grid item xs={5}>
                  <Typography className="invoiceTotalChargesTitle">
                    Total:
                    {' '}
                    <span className="notranslate">{`$${totalCost}`}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Divider between charges and shipments sections */}
            <div className="invoiceDivider" />

            {/* Right side - Shipments section */}
            <Grid item xs={12} sm={5.98} className="invoiceShipmentsContainer">
              {!_.isEmpty(whatsappChargesData.shipments)
                ? (
                  <Grid container>
                    {whatsappChargesData.shipments.map((item, index) => (
                      <React.Fragment key={`${item.name}-${index}`}>
                        <Grid item xs={7}>
                          <Typography variant="body2">{item.name}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="body2">{`Tracker: ${item.tracker[0]}`}</Typography>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                )
                : <Typography className="invoiceShipmentDataEmptyText">No shipments are available</Typography>}
            </Grid>
          </Grid>
        ) : <Typography className="invoiceEmptyText">No data to display</Typography>}
    </div>
  );
};

export default Invoices;
