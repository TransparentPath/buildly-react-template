import { httpService } from "@modules/http/http.service";

export const getItemTypes = async (organization) => {
  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/item_type/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching item types:", error);
    return [];
  }
};
