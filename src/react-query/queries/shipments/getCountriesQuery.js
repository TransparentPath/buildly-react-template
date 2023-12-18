import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getCountriesQuery = async () => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load countries and related states due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      "https://countriesnow.space/api/v0.1/countries/states"
    );
    if (response && response.data && response.data.data) {
      let countries = [];
      _.forEach(response.data.data, (country) => {
        if (
          !_.includes(
            ["cuba", "iran", "north korea", "russia", "syria", "venezuela"],
            _.toLower(country.name)
          )
        ) {
          countries = [
            ...countries,
            {
              country: country.name,
              iso3: country.iso3,
              states: _.sortBy(_.without(_.uniq(country.states), [""])),
            },
          ];
        }
      });
      countries = _.uniqBy(countries, "country");
      return countries;
    }
  } catch (error) {
    console.error("Error fetching countries and related states:", error);
    showErrorAlert();
    return [];
  }
};
