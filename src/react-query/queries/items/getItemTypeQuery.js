import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getItemTypeQuery = async (organization) => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load item types due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}shipment/item_type/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching item types:", error);
    showErrorAlert();
    return [];
  }
};
