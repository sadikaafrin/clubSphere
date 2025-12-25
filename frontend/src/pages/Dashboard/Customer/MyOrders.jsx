import { useQuery } from '@tanstack/react-query';
import CustomerOrderDataRow from '../../../components/Dashboard/TableRows/CustomerOrderDataRow'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link, useNavigate } from 'react-router';

const MyOrders = () => {
 const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["myClubs", user?.email], // Changed from "orders"
    queryFn: async () => {
      // FIX: Remove the stray 't' at the end
      const result = await axiosSecure.get(`/my-club-list/${user.email}`);
      return result.data;
    },
    enabled: !!user?.email, // Important: only fetch when user exists
  });
  
  if (isLoading) return <LoadingSpinner />;
  return (
   <div className='container mx-auto px-4 sm:px-8'>
      <div className='py-8'>
        <h1 className="text-2xl font-bold mb-6">My Clubs</h1>
        
        <div className='-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto'>
          <div className='inline-block min-w-full shadow rounded-lg overflow-hidden'>
            <table className='min-w-full leading-normal'>
              <thead>
                <tr>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Image
                  </th>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Club Name
                  </th>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Category
                  </th>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Price
                  </th>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Join Date
                  </th>
                  <th className='px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center bg-white">
                      <div className="text-gray-600 mb-4">
                        You haven't joined or created any clubs yet.
                      </div>
                      <button
                        onClick={() => navigate('/clubs')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Browse Clubs
                      </button>
                    </td>
                  </tr>
                ) : (
                  clubs.map(club => (
                    <tr key={club._id} className="hover:bg-gray-50">
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <img 
                          src={club.image || '/default-club.jpg'} 
                          alt={club.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-medium">
                          {club.name}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {club.category}
                        </span>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {club.price > 0 ? `$${club.price}` : 'Free'}
                        </p>
                      </td>
                    
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap text-sm">
                          {club.joinDate ? new Date(club.joinDate).toLocaleDateString() : '-'}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <Link  to={`/dashboard/clubs/${club._id}/events`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Visit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrders
