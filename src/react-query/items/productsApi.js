import { httpService } from "@modules/http/http.service";

export const getProducts = async (organization) => {
  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/product?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
