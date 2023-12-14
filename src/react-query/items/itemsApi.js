import { httpService } from "@modules/http/http.service";

export const getItems = async (organization) => {
  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/item/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};
