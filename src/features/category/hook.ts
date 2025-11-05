import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchCategories,
  selectCategoryList,
  selectCategoryStatus,
} from "./slice";

export const useCategories = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategoryList);
  const status = useAppSelector(selectCategoryStatus);

  const reload = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]); 

  return {
    categories,
    status,
    reload,
    isLoading: status === "loading",
  };
};