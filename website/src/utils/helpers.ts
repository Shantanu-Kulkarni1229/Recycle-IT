// Authentication utility functions

export const getToken = (): string | null => {
  return localStorage.getItem('recyclerToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('recyclerToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('recyclerToken');
  localStorage.removeItem('recyclerData');
};

export const getRecyclerData = (): any => {
  const data = localStorage.getItem('recyclerData');
  return data ? JSON.parse(data) : null;
};

export const setRecyclerData = (data: any): void => {
  localStorage.setItem('recyclerData', JSON.stringify(data));
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Date utility functions
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Status utility functions
export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Scheduled': 'bg-blue-100 text-blue-800',
    'In Transit': 'bg-purple-100 text-purple-800',
    'Collected': 'bg-green-100 text-green-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Verified': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Under Inspection': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Paid': 'bg-green-100 text-green-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Weight formatting
export const formatWeight = (weight: number): string => {
  return `${weight} kg`;
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
