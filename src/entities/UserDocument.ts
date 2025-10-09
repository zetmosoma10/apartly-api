export type UserDocument = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "tenant" | "landlord" | "admin";
  avatar?: {
    url: string;
    public_url: string;
  };
  generateJwt: () => string;
};
