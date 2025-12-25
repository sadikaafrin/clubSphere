import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { FaUserCheck } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { GrView } from "react-icons/gr";

const AllMemberUser = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: clubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-membership");
      console.log(res.data);
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl">Approve pending clubs: {clubs.length}</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>Club Name</th>
              <th>Member Email</th>
              <th>JoinDate</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {clubs.map((event, index) => (
              <tr key={event._id}>
                <th>{index + 1}</th>
                <td>{event.clubName}</td>
                <td>{event.userEmail}</td>
                <td>
                  {event.joinDate
                    ? new Date(event.joinDate).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllMemberUser;
