import { Query, Document } from "mongoose";

type QueryString = {
  search?: string;
  sort?: string;
  status?: string;
  type?: string;
  page?: string;
  limit?: string;
  minPrice?: string;
  maxPrice?: string;
};

class ApiFeatures<T extends Document> {
  mongooseQuery: Query<T[], T>;
  queryString: QueryString;
  filtersApplied: Record<string, any> = {};

  constructor(mongooseQuery: Query<T[], T>, queryString: QueryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // * SEARCH WITH MONGODB TEXT INDEX
  search() {
    const { search } = this.queryString;

    if (search) {
      const searchCondition = {
        $text: { $search: search },
      };

      // * Add search condition to applied filers
      this.filtersApplied = { ...this.filtersApplied, ...searchCondition };

      this.mongooseQuery = this.mongooseQuery
        .find(searchCondition)
        .sort({ score: { $meta: "textScore" } })
        .select({ score: { $meta: "textScore" } });
    }

    return this;
  }

  // * FILTER BY FIELDS
  filter() {
    const { maxPrice, minPrice, status, type } = this.queryString;

    const queryObj: Record<string, any> = {};

    // * FILTER BY STATUS (e.g available, rented)
    if (status) queryObj.status = this.queryString.status;

    // * FILTER BY PRICE
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};

      // * attach price filters to priceFilter   e.g { $gte: 5 }
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);

      // * only add price filter if they are valid
      if (!isNaN(priceFilter.$gte ?? 0) || !isNaN(priceFilter.$lte ?? 0)) {
        queryObj.price = priceFilter;
      }
    }

    // * FILTER BY TYPE e.g (1-bedroom, studio)
    if (type) {
      queryObj.type = type;
    }

    this.filtersApplied = { ...this.filtersApplied, ...queryObj };
    this.mongooseQuery = this.mongooseQuery.find(queryObj);

    return this;
  }

  // * SORT e.g (sort=price or sort=-createdAt)
  sort() {
    const sortBy = this.queryString.sort;

    if (sortBy) {
      const sortString = sortBy?.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.find().sort(sortString);
    } else {
      this.mongooseQuery = this.mongooseQuery.find().sort("-createdAt");
    }

    return this;
  }

  // * PAGINATION
  pagination() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.find().skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
