import _ from 'lodash';
import moment from 'moment';

export const custodianColumns = [
  {
    name: 'name',
    label: 'Name',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'location',
    label: 'Location',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
    },
  },
  {
    name: 'custodian_glns',
    label: 'GLN',
    options: {
      sort: true,
      sortThirdClickReset: true,
      filter: true,
      customBodyRender: (value) => value || '-',
    },
  },
];

export const getUniqueContactInfo = (rowItem, contactInfo) => {
  let obj = '';
  _.forEach(contactInfo, (info) => {
    if (rowItem.contact_data[0] === info.url) {
      obj = info;
    }
  });
  return obj;
};

export const getFormattedRow = (data, contactInfo, custodyData) => {
  const customizedRow = [...data];
  if (data && data.length && contactInfo && contactInfo.length) {
    customizedRow.forEach((rowItem) => {
      const contactInfoItem = getUniqueContactInfo(rowItem, contactInfo);
      rowItem.location = `${
        contactInfoItem.address1
        && `${contactInfoItem.address1},`
      } ${
        contactInfoItem.address2
        && `${contactInfoItem.address2},`
      } ${
        contactInfoItem.city
        && `${contactInfoItem.city},`
      } ${
        contactInfoItem.state
        && `${contactInfoItem.state},`
      } ${
        contactInfoItem.country
        && `${contactInfoItem.country},`
      } ${
        contactInfoItem.postal_code
        && `${contactInfoItem.postal_code}`
      }`;
    });
  }

  return _.orderBy(
    customizedRow,
    (row) => moment(row.create_date),
    ['asc'],
  );
};
