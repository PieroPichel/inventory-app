import { Client, Account, Databases, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://api.bitswork.net")
  .setProject("697dc55900296fa9ede8");

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };
