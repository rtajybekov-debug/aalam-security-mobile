import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "../types/common";

interface UsePaginatedListOptions<T> {
  queryKey: (string | number)[];
  limit?: number;
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>;
}

export const usePaginatedList = <T,>({
  queryKey,
  limit = 20,
  fetcher,
}: UsePaginatedListOptions<T>) =>
  useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
