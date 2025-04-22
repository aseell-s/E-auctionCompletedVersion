import { Role, AuctionStatus } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isApproved: boolean;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  email?: string;
  phone?: string;
  companyRegNo?: string;
  city?: string;
  state?: string;
  pincode?: string;
  establishedAt?: Date;
  natureOfBusiness?: string;
  panNo?: string;
  contactNo?: string;
  dob?: Date;
  address?: string;
  country?: string;
  company?: string;
  taxId?: string;
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: Date;
  bidder: {
    id: string;
    name: string;
  };
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  images: string[];
  sellerId: string;
  status: AuctionStatus;
  isApproved: boolean;
  createdAt: Date;
  endTime: Date;
  updatedAt: Date;
  seller: {
    id: string;
    name: string;
    email: string;
    profile?: Profile;
  };
  bids?: Bid[];
}

export interface ApprovalsData {
  pendingSellers: User[];
  pendingAuctions: Auction[];
  totalUsers: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface FormData {
  email: string;
  password: string;
  userType: Role;
  name?: string;
}
