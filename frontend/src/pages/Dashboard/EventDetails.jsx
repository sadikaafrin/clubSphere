import { useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  

  // 1. Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/events/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // 2. Setup the Join Event Mutation
  const { mutateAsync } = useMutation({
    mutationFn: async (joinData) => {
      const { data } = await axiosSecure.post("/join-event", joinData);
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully joined the event!");
    },
    onError: (err) => {
      // Handles the 400 status (already joined) or 403 (mismatch)
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    },
  });

  const handleJoinEvent = async () => {
    if (!user?.email) {
      return toast.error("Please login to join this event");
    }

    const joinData = {
      eventId: event._id,
      clubId: event.clubId,
      userEmail: user?.email,
    };

    try {
      await mutateAsync(joinData);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-10 text-center text-red-500">Error loading event details</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar */}
        <div className="md:w-1/3">
          <div className="bg-base-100 shadow-sm border border-gray-100 rounded-sm overflow-hidden">
            <img 
              src={event?.image || "https://i.ibb.co/image-placeholder.jpg"} 
              alt="Event" 
              className="w-full h-64 object-cover"
            />
            <div className="p-6 bg-gray-50">
              <p className="text-gray-500 text-sm italic mb-8 leading-relaxed">
                Business it will frequently occur that pleasures have to be repudiated and annoyances accepted.
              </p>
              
              {/* JOIN BUTTON TRIGGER */}
              <button 
                onClick={handleJoinEvent}
                 disabled={!event?._id}
                className="btn btn-primary w-full rounded-none bg-[#23a2d9] border-none hover:bg-[#1e8dbd] text-white uppercase tracking-wider"
              >
                Join This Event
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="md:w-2/3">
          <hr className="border-gray-100 my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start</h3>
              <p className="text-gray-600 font-medium">{event?.eventDate}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Address</h3>
              <p className="text-gray-600 font-medium mb-1">{event?.location}</p>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

        
        </div>
      </div>
    </div>
  );
};

export default EventDetails;