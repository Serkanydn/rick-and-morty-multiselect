import { ResponseModel } from ".";

export interface ListResponseModel<T> extends ResponseModel {
  results: T[];
}
