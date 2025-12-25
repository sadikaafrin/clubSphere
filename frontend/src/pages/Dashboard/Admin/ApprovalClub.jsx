import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { FaUserCheck } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { GrView } from "react-icons/gr";

const ApproveClub = () => {
  const axiosSecure = useAxiosSecure();
  const { refetch, data: clubs = [] } = useQuery({
    queryKey: ["clubs", "pending"],
    queryFn: async () => {
      const res = await axiosSecure.get("/approve-clubs");
      return res.data;
    },
  });

    // update club status
  const updateclubstatus = (club, status) => {
    // const updateInfo = { status };
    axiosSecure.patch(`/approve-clubs/${club._id}`, {status}).then((res) => {
      if (res.data.modifiedCount) {
        refetch();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Club status is set to ${status}`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  //   handle approval
  const handleApproval = (club) => {
    updateclubstatus(club, "approved");
  };

  //   handle reject
  const handleRejection = (club) => {
    updateclubstatus(club, "rejected");
  };
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
              <th>Manager Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Application Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {clubs.map((club, index) => (
              <tr key={club._id}>
                <th>{index + 1}</th>
                <td>{club.name}</td>
                <td>{club?.manager.name}</td>
                <td>{club?.manager.email}</td>
                <td>{club.location}</td>
                <td
                  className={`${
                    club.status === "approved"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {club.status}
                </td>
                <td>
                  <button
                    onClick={() => handleApproval(club)}
                    className="btn m-3"
                  >
                    <FaUserCheck />
                  </button>
                  <button
                    onClick={() => handleRejection(club)}
                    className="btn m-2"
                  >
                    <IoPersonRemove />
                  </button>
                  <button className="btn">
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
    </div>
  );
};

export default ApproveClub;
