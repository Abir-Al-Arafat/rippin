export interface CreateUserQueryParams {
  loginAfterCreate?: boolean;
}

export interface IQuery {
  role?: string;
  isAffiliate?: boolean;
  isActive?: boolean;
  name?: string | { $regex: RegExp };
  email?: string | { $regex: RegExp };
}
