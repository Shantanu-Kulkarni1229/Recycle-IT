// Type definitions for the recycler dashboard

export interface Recycler {
  _id: string;
  ownerName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  verificationDocuments: Array<{
    documentType: string;
    documentUrl: string;
    uploadedAt: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulePickup {
  _id: string;
  userId: User;
  deviceType: string;
  brand: string;
  model: string;
  purchaseDate: Date;
  timeSincePurchase: string;
  condition: 'Working' | 'Partially Working' | 'Not Working' | 'Scrap';
  weight?: number;
  notes?: string;
  pickupAddress: string;
  city: string;
  state: string;
  pincode: string;
  preferredPickupDate: Date;
  pickupStatus: 'Pending' | 'Scheduled' | 'In Transit' | 'Collected' | 'Delivered' | 'Verified' | 'Cancelled';
  assignedRecyclerId?: string;
  assignedDeliveryAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecyclerPickup {
  _id: string;
  pickupId: SchedulePickup;
  recyclerId: string;
  userId: string;
  deviceConditionReport: {
    physicalDamage: number; // percentage
    workingComponents: string[];
    reusableSemiconductors: number;
    scrapValue: number;
  };
  inspectionStatus: 'Pending' | 'Under Inspection' | 'Completed';
  proposedPayment: number;
  finalPayment: number;
  paymentStatus: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  inspectionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  pendingPickups: number;
  completedToday: number;
  inProgress: number;
  monthlyRevenue: number;
  totalPickups: number;
  averageRating: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  ownerName: string;
  companyName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InspectionReportData {
  pickupId: string;
  deviceConditionReport: {
    physicalDamage: number;
    workingComponents: string[];
    reusableSemiconductors: number;
    scrapValue: number;
  };
  proposedPayment: number;
  inspectionNotes: string;
}
