const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export interface Testimonial {
  _id: string;
  recyclerId: {
    _id: string;
    ownerName?: string;
    companyName?: string;
    email: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  feedback: string;
  rating: number;
  createdAt: string;
}

export interface TestimonialsResponse {
  testimonials: Testimonial[];
}

class TestimonialAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('recyclerToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private getAdminAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Get testimonials for a specific recycler (for recycler dashboard)
  async getTestimonialsForRecycler(recyclerId?: string): Promise<TestimonialsResponse> {
    const url = recyclerId 
      ? `${API_BASE_URL}/testimonials/recycler/${recyclerId}`
      : `${API_BASE_URL}/testimonials/my-testimonials`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  // Get all testimonials (for admin dashboard)
  async getAllTestimonials(): Promise<TestimonialsResponse> {
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'GET',
      headers: this.getAdminAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  // Add a new testimonial (if needed for testing)
  async addTestimonial(testimonialData: {
    recyclerId: string;
    userId: string;
    feedback: string;
    rating: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(testimonialData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }
}

export const testimonialAPI = new TestimonialAPI();