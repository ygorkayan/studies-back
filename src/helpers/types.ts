export type Login = {
  id: number;
  user: string;
  password: string;
};

export type Token = {
  user: string;
  userId: number;
  expiration: number;
};
