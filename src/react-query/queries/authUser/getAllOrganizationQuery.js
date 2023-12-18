import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getAllOrganizationQuery = async () => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load organizations due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}organization`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    showErrorAlert();
    return [];
  }
};
