export interface PaginationOptions {
    page: number;
    limit: number;
  }
  
  export function getPaginationOptions(page: number, limit: number): PaginationOptions {
    const pageNumber = Math.max(page, 1); 
    const limitNumber = Math.max(limit, 1); 
  
    return {
      page: pageNumber,
      limit: limitNumber,
    };
  }
  