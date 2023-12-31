import BaseService from "./baseService";
import variables from "../constants/variables.json";
import { AxiosResponse } from "axios";
import RickAndMorty from "../models/rickAndMorty";
import { ListResponseModel } from "../models/response/listResponseModel";

class RickAndMortiService extends BaseService {
  async getCharacterWithName(
    name: string
  ): Promise<AxiosResponse<ListResponseModel<RickAndMorty>>> {
    return await this.get<ListResponseModel<RickAndMorty>>({
      params: {
        name,
      },
    });
  }
}

export default new RickAndMortiService(variables.rickAndMortiCharacterBaseUrl);
