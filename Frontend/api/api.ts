import axios from "axios";

const api = axios.create({
  baseURL: "http://10.197.110.46:5000/api/", // your laptop LAN IP
  withCredentials: true,
});

export const createPickup = (data: any) => api.post("schedule-pickup/", data);
export const updatePickup = (id: string, data: any) => api.put(`schedule-pickup/${id}`, data);
export const cancelPickup = (id: string) => api.put(`schedule-pickup/${id}/cancel`);
export const getUserPickups = (userId: string) => api.get(`schedule-pickup/user/${userId}`);
export const getPickupById = (id: string) => api.get(`schedule-pickup/${id}`);
export const assignRecycler = (id: string, recyclerId: string) => api.put(`schedule-pickup/${id}/assign-recycler`, { recyclerId });
export const assignDeliveryAgent = (id: string, agentId: string) => api.put(`schedule-pickup/${id}/assign-agent`, { agentId });
export const updatePickupStatus = (id: string, status: string) => api.put(`schedule-pickup/${id}/status`, { status });
export const trackPickup = (id: string) => api.get(`schedule-pickup/${id}/track`);
export const deletePickup = (id: string) => api.delete(`schedule-pickup/${id}`);


export default api;
