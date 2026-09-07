import { z } from 'zod';

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PageResult<T> = {
    data: T[];
    page: number;
    limit: number;
    total: number;
};

export const toPage = <T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PageResult<T> => ({ data, page, limit, total });

export const skipTake = (page: number, limit: number) => ({
    skip: (page - 1) * limit,
    take: limit
});
