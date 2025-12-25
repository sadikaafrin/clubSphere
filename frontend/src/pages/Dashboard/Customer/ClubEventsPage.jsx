import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const ClubEventsPage = () => {
  const { clubId } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();


  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["club-events-member", clubId, user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/events/club/${clubId}/member`);
      console.log("Fetched events from API:", res.data.events);
      return res.data;
    },
    enabled: !!clubId && !!user?.email,
  });

  if (isLoading) return <LoadingSpinner />;

  const events = eventsData?.events || [];
  const isMember = eventsData?.isMember || false;

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Club Events</h1>
        <p className="text-gray-600">
          Browse and join upcoming events from your club
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Event Card 1 */}
        {events.map((data) => (
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="badge badge-primary badge-outline mb-2">
                    Free
                  </div>
                  <h2 className="card-title text-xl font-bold">{data.name}</h2>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {data.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{data.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-medium">{data.location}</span>
                </div>
              </div>

              <div className="card-actions justify-end">
                <Link to={`/dashboard/event-list/${data._id}`}>
                <button className="btn btn-primary"  >
                  DETAILS
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
                </Link>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubEventsPage;
