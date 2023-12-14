import { httpService } from "@modules/http/http.service";

export const getProductTypes = async (organization) => {
  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/product_type/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product types:", error);
    return [];
  }
};
