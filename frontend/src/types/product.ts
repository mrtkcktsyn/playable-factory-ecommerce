export type CategorySummary = {
    id: string;
    name: string;
    slug?: string;
}

export type Product = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    images?: string[];
    isActive: boolean;
    category?: CategorySummary | string;
    createdAt?: string;
    updatedAt?: string;
}

export type PaginatedProductsResponse = {
    items: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}