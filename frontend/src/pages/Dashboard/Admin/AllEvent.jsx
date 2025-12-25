import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { FaUserCheck } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { GrView } from "react-icons/gr";

const AllEvent = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: events = [] } = useQuery({
    queryKey: ["events", "pending"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-events");
      console.log(res.data);
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl">Approve pending events: {events.length}</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Event Name</th>
              <th>Club Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {events.map((event, index) => (
              <tr key={event._id}>
                <th>{index + 1}</th>
                <td>{event.name}</td>
                <td>{event.clubName}</td>
                <td>{event.createdBy}</td>
                <td>{event.location}</td>
                <td>
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllEvent;
