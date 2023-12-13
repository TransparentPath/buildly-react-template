import { httpService } from "@modules/http/http.service";
import create from "zustand";

const shipmentApiEndPoint = "shipment/";

const useStore = create((set) => ({
  items: [],
  itemTypes: [],
  unit: [],
  products: [],
  productTypes: [],
  getItems: async (organization) => {
    try {
      const response = await httpService.makeRequest(
        "get",
        `${window.env.API_URL}${shipmentApiEndPoint}item/?organization_uuid=${organization}`
      );
      set({ items: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  },
  getItemTypes: async (organization) => {
    try {
      const response = await httpService.makeRequest(
        "get",
        `${window.env.API_URL}${shipmentApiEndPoint}item_type/?organization_uuid=${organization}`
      );
      set({ itemTypes: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching item types:", error);
      return [];
    }
  },
  getUnit: async (organization) => {
    try {
      const response = await httpService.makeRequest(
        "get",
        `${window.env.API_URL}${shipmentApiEndPoint}unit_of_measure/?organization_uuid=${organization}`
      );
      set({ unit: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching units:", error);
      return [];
    }
  },
  getProducts: async (organization) => {
    try {
      const response = await httpService.makeRequest(
        "get",
        `${window.env.API_URL}${shipmentApiEndPoint}product?organization_uuid=${organization}`
      );
      set({ products: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
  getProductTypes: async (organization) => {
    try {
      const response = await httpService.makeRequest(
        "get",
        `${window.env.API_URL}${shipmentApiEndPoint}product_type/?organization_uuid=${organization}`
      );
      set({ productTypes: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching product types:", error);
      return [];
    }
  },
}));

export { useStore };
