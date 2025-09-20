const API_BASE_URL = 'http://localhost:5000/api';

export interface ServiceArea {
  city: string;
  pincode: string;
  isActive: boolean;
}

export interface WorkingHours {
  day: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

export interface PerformanceMetrics {
  totalDeliveries: number;
  completedDeliveries: number;
  successRate: number;
  averageRating: number;
  totalRatings: number;
}

export interface DeliveryPartner {
  _id: string;
  recyclerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  alternateNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  vehicleType: 'Bicycle' | 'Motorcycle' | 'Car' | 'Van' | 'Truck' | 'E-Rickshaw';
  vehicleNumber: string;
  vehicleMake?: string;
  vehicleModel?: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  serviceAreas: ServiceArea[];
  workingHours: WorkingHours[];
  baseSalary?: number;
  commissionPerDelivery?: number;
  isAvailable: boolean;
  status: 'Active' | 'Inactive' | 'Suspended';
  performanceMetrics: PerformanceMetrics;
  joinDate: string;
  profilePicture?: string;
  documentsUrls?: string[];
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryPartnerRequest {
  name: string;
  email: string;
  phoneNumber: string;
  alternateNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  vehicleType: string;
  vehicleNumber: string;
  vehicleMake?: string;
  vehicleModel?: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  serviceAreas: ServiceArea[];
  workingHours: WorkingHours[];
  baseSalary?: number;
  commissionPerDelivery?: number;
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
}

export interface UpdateDeliveryPartnerRequest extends Partial<CreateDeliveryPartnerRequest> {
  isAvailable?: boolean;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface DeliveryPartnersResponse {
  success: boolean;
  message: string;
  data: {
    deliveryPartners: DeliveryPartner[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPartners: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface DeliveryPartnerResponse {
  success: boolean;
  message: string;
  data: DeliveryPartner;
}

class DeliveryPartnerAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('recyclerToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async createDeliveryPartner(partnerData: CreateDeliveryPartnerRequest): Promise<DeliveryPartnerResponse> {
    console.log('Creating delivery partner with data:', partnerData);
    
    const response = await fetch(`${API_BASE_URL}/delivery-partners`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(partnerData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  async getDeliveryPartners(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      isAvailable?: boolean;
      city?: string;
      vehicleType?: string;
    }
  ): Promise<DeliveryPartnersResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/delivery-partners?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  async getDeliveryPartnerById(id: string): Promise<DeliveryPartnerResponse> {
    const response = await fetch(`${API_BASE_URL}/delivery-partners/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateDeliveryPartner(
    id: string,
    updateData: UpdateDeliveryPartnerRequest
  ): Promise<DeliveryPartnerResponse> {
    const response = await fetch(`${API_BASE_URL}/delivery-partners/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteDeliveryPartner(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/delivery-partners/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getAvailablePartners(area: { city: string; pincode: string }): Promise<DeliveryPartnersResponse> {
    const queryParams = new URLSearchParams({
      city: area.city,
      pincode: area.pincode,
    });

    const response = await fetch(`${API_BASE_URL}/delivery-partners/available?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  async updatePartnerAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<DeliveryPartnerResponse> {
    const response = await fetch(`${API_BASE_URL}/delivery-partners/${id}/availability`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isAvailable }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const deliveryPartnerAPI = new DeliveryPartnerAPI();
export default deliveryPartnerAPI;