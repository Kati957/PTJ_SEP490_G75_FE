import { useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchSubCategories,
  fetchSubCategoriesByCategory,
} from "./slice";
import type { RootState } from "../../app/store";
import type { SubCategory } from "./type";

export const useSubCategories = (categoryId?: number | null) => {
  const dispatch = useAppDispatch();

  const {
    all,
    status,
    error,
    byCategory,
    statusByCategory,
  } = useAppSelector((state: RootState) => state.subcategory);

  const normalizedCategoryId =
    categoryId !== undefined && categoryId !== null ? categoryId : null;

  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchSubCategories());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (normalizedCategoryId === null) {
      return;
    }

    const scopedStatus = statusByCategory[normalizedCategoryId] ?? "idle";

    const hasCache =
      Array.isArray(byCategory[normalizedCategoryId]) &&
      byCategory[normalizedCategoryId]!.length > 0;

    if (!hasCache && (scopedStatus === "idle" || scopedStatus === "failed")) {
      dispatch(fetchSubCategoriesByCategory(normalizedCategoryId));
    }
  }, [normalizedCategoryId, byCategory, statusByCategory, dispatch]);

  const groupedFromAll = useMemo(() => {
    return all.reduce<Record<number, SubCategory[]>>((acc, current) => {
      if (!acc[current.categoryId]) {
        acc[current.categoryId] = [];
      }
      acc[current.categoryId].push(current);
      return acc;
    }, {});
  }, [all]);

  const currentList = useMemo(() => {
    if (normalizedCategoryId === null) {
      return all;
    }

    if (byCategory[normalizedCategoryId]) {
      return byCategory[normalizedCategoryId]!;
    }

    return groupedFromAll[normalizedCategoryId] ?? [];
  }, [normalizedCategoryId, all, byCategory, groupedFromAll]);

  const currentStatus =
    normalizedCategoryId === null
      ? status
      : statusByCategory[normalizedCategoryId] ?? status;

  const reload = useCallback(() => {
    if (normalizedCategoryId === null) {
      dispatch(fetchSubCategories());
    } else {
      dispatch(fetchSubCategoriesByCategory(normalizedCategoryId));
    }
  }, [dispatch, normalizedCategoryId]);

  return {
    subCategories: currentList,
    status: currentStatus,
    error,
    isLoading: currentStatus === "loading",
    reload,
  };
};
