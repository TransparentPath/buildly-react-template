import { httpService } from "@modules/http/http.service";

export const getUnits = async (organization) => {
  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/unit_of_measure/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching units:", error);
    return [];
  }
};
