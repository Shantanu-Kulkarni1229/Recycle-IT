import React, { useState, useEffect } from 'react';
import { testimonialAPI, Testimonial } from '../services/testimonialAPI';

const MyTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await testimonialAPI.getTestimonialsForRecycler();
        const testimonialsData = response.testimonials || [];
        setTestimonials(testimonialsData);
        
        // Calculate stats
        calculateStats(testimonialsData);
      } catch (error: any) {
        console.error('Error fetching testimonials:', error);
        setError(error.message || 'Failed to load testimonials');
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testimonialAPI.getTestimonialsForRecycler();
      const testimonialsData = response.testimonials || [];
      setTestimonials(testimonialsData);
      
      // Calculate stats
      calculateStats(testimonialsData);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      setError(error.message || 'Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (testimonialsData: Testimonial[]) => {
    const totalReviews = testimonialsData.length;
    const averageRating = totalReviews > 0 
      ? testimonialsData.reduce((sum, t) => sum + t.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    testimonialsData.forEach(t => {
      ratingDistribution[t.rating as keyof typeof ratingDistribution]++;
    });

    setStats({ totalReviews, averageRating, ratingDistribution });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Testimonials</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTestimonials}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Testimonials & Ratings</h1>
        <p className="text-gray-600 mt-2">See what your customers are saying about your service</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ratingDistribution[5]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.totalReviews > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-12">{rating} star</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-yellow-400 h-2 transition-all duration-300 ${
                          percentage > 0 ? 'w-full' : 'w-0'
                        }`}
                        data-percentage={percentage}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Testimonials Yet</h3>
          <p className="text-gray-600 mb-4">You haven't received any customer feedback yet.</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Provide excellent service to receive positive reviews</p>
            <p>• Ask satisfied customers to leave feedback</p>
            <p>• Build trust with new customers through testimonials</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{testimonial.userId.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.userId.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(testimonial.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-700 italic">"{testimonial.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTestimonials;