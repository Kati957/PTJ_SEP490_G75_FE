export interface RawPagedResponse<T> {
  items?: T[];
  Items?: T[];
  data?: T[];
  Data?: T[];
  total?: number;
  Total?: number;
  totalItems?: number;
  TotalItems?: number;
  page?: number;
  Page?: number;
  currentPage?: number;
  CurrentPage?: number;
  pageSize?: number;
  PageSize?: number;
  limit?: number;
  Limit?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const adaptPagedResult = <T>(payload: RawPagedResponse<T> | undefined): PagedResult<T> => {
  const items =
    payload?.items ??
    payload?.Items ??
    payload?.data ??
    payload?.Data ??
    [];

  const total =
    payload?.total ??
    payload?.Total ??
    payload?.totalItems ??
    payload?.TotalItems ??
    items.length;

  const page =
    payload?.page ??
    payload?.Page ??
    payload?.currentPage ??
    payload?.CurrentPage ??
    1;

  const pageSize =
    payload?.pageSize ??
    payload?.PageSize ??
    payload?.limit ??
    payload?.Limit ??
    items.length;

  return {
    items,
    total,
    page,
    pageSize
  };
};

export type { PagedResult };
