import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getItemQuery = async (organization) => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load items due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/item/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    showErrorAlert();
    return [];
  }
};
