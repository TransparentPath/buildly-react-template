//get items action constants
export const GET_ITEMS = "ITEMS/GET_ITEMS";
export const GET_ITEMS_SUCCESS = "ITEMS/GET_ITEMS_SUCCESS";
export const GET_ITEMS_FAILURE = "ITEMS/GET_ITEMS_FAILURE";

//add items action constants
export const ADD_ITEMS = "ITEMS/ADD_ITEMS";
export const ADD_ITEMS_SUCCESS = "ITEMS/ADD_ITEMS_SUCCESS";
export const ADD_ITEMS_FAILURE = "ITEMS/ADD_ITEMS_FAILURE";

//edit items action constants
export const EDIT_ITEMS = "ITEMS/EDIT_ITEMS";
export const EDIT_ITEMS_SUCCESS = "ITEMS/EDIT_ITEMS_SUCCESS";
export const EDIT_ITEMS_FAILURE = "ITEMS/EDIT_ITEMS_FAILURE";

//delete items action constants
export const DELETE_ITEMS = "ITEMS/DELETE_ITEMS";
export const DELETE_ITEMS_SUCCESS = "ITEMS/DELETE_ITEMS_SUCCESS";
export const DELETE_ITEMS_FAILURE = "ITEMS/DELETE_ITEMS_FAILURE";

//search items action constants
export const SEARCH = "ITEMS/SEARCH";
export const SEARCH_SUCCESS = "ITEMS/SEARCH_SUCCESS";

//get item types action constants
export const GET_ITEMS_TYPE = "ITEMS/GET_ITEMS_TYPE";
export const GET_ITEMS_TYPE_SUCCESS = "ITEMS/GET_ITEMS_TYPE_SUCCESS";
export const GET_ITEMS_TYPE_FAILURE = "ITEMS/GET_ITEMS_TYPE_FAILURE";

export const getItems = () => ({ type: GET_ITEMS });

/**
 *Add Item
 * @param {Object} payload
 * @param {Object} history
 */
export const addItem = (payload, history) => ({
  type: ADD_ITEMS,
  payload,
  history,
});
/**
 *
 * @param {Object} payload
 * @param {Object} history
 */
export const editItem = (payload, history) => ({
  type: EDIT_ITEMS,
  payload,
  history,
});

/**
 *Delete Item entity
 * @param {{id}} payload
 */
export const deleteItem = (itemId) => ({
  type: DELETE_ITEMS,
  itemId,
});

/**
 *
 * @param {String} searchItem
 * @param {Array} searchList
 */
export const searchItem = (searchItem, searchList) => ({
  type: SEARCH,
  searchItem,
  searchList,
});

export const getItemType = () => ({
  type: GET_ITEMS_TYPE,
});