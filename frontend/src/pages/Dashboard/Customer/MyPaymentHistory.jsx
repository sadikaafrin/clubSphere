import { useQuery } from "@tanstack/react-query";
import { FaUserCheck } from "react-icons/fa";
import { IoPersonRemove } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { GrView } from "react-icons/gr";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const MyPaymentHistory = () => {
  const axiosSecure = useAxiosSecure();
  const {
    data: clubPayment = [],
    isError,
    error,
  } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const res = await axiosSecure.get("/payment-history");
      console.log("Payments:", res.data);
      return res.data;
    },
  });

  if (isError) {
    console.error("Query error:", error);
  }

  return (
    <div>
      <h1 className="text-3xl">Payment History: {clubPayment.length}</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th>#</th>
              <th>Club Name</th>
              <th>Club Type</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {clubPayment.map((event, index) => (
              <tr key={event._id}>
                <th>{index + 1}</th>
                <td>{event.name}</td>
                <td>{event.category}</td>
                <td>{event.member}</td>
                <td>{event.price}</td>
                <td>
                  {event.paidAt
                    ? new Date(event.paidAt).toLocaleDateString()
                    : "-"}
                </td>
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

export default MyPaymentHistory;
