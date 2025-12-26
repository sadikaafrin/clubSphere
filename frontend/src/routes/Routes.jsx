import Home from "../pages/Home/Home";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import PlantDetails from "../pages/PlantDetails/PlantDetails";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import AddPlant from "../pages/Dashboard/Seller/AddClub";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import Profile from "../pages/Dashboard/Common/Profile";
import Statistics from "../pages/Dashboard/Common/Statistics";
import MainLayout from "../layouts/MainLayout";
import MyInventory from "../pages/Dashboard/Seller/MyInventory";
// import ManageOrders from "../pages/Dashboard/Seller/ManageOrders";
import MyOrders from "../pages/Dashboard/Customer/MyOrders";
import { createBrowserRouter } from "react-router";
import Clubs from "../pages/Club/Clubs";
import PaymentSuccess from "../Payment/PaymentSuccess";
// import SellerRequest from "../pages/Dashboard/Admin/SellerRequest";
import ManagerRoute from "./ManagerRoute";
import AdminRoute from "./AdminRoute";
import ApprovalClub from "../pages/Dashboard/Admin/ApprovalClub";
import AddEvent from "../pages/Dashboard/Seller/AddEvent";
import ClubEventsPage from "../pages/Dashboard/Customer/ClubEventsPage";
import EventDetails from "../pages/Dashboard/EventDetails";
import MyEvents from "../pages/Dashboard/Seller/MyEvents";
import AllEvent from "../pages/Dashboard/Admin/AllEvent";
import AllMemberUser from "../pages/Dashboard/Admin/AllMemberUser";
import MyPaymentHistory from "../pages/Dashboard/Customer/MyPaymentHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/all-club",
        element: <Clubs />,
      },

      {
        path: "/clubs/:id",
        element: <PlantDetails />,
      },
    ],
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess></PaymentSuccess>,
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  // { path: "add-club", element: <AddPlant></AddPlant>},
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    // },
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Statistics />
          </PrivateRoute>
        ),
      },

      {
        path: "event-list/:id",
        element: (
          <PrivateRoute>
            <EventDetails></EventDetails>
          </PrivateRoute>
        ),
      },

      // only for admin
      {
        path: "all-club-approval",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <ApprovalClub></ApprovalClub>
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "all-event",
        element: (
          <PrivateRoute>
            <AdminRoute>
             <AllEvent></AllEvent>
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "add-club",
        element: (
          <PrivateRoute>
            <ManagerRoute>
              <AddPlant />
            </ManagerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "add-event",
        element: (
          <PrivateRoute>
            <ManagerRoute>
              <AddEvent />
            </ManagerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "my-club",
        element: (
          <PrivateRoute>
            <ManagerRoute>
              <MyInventory />
            </ManagerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "my-events",
        element: (
          <PrivateRoute>
            <ManagerRoute>
              <MyEvents />
            </ManagerRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-users",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "all-membership-user",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AllMemberUser />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
    
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "my-payment-history",
        element: (
          <PrivateRoute>
            <MyPaymentHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/clubs/:clubId/events",
        element: (
          <PrivateRoute>
            <ClubEventsPage></ClubEventsPage>
          </PrivateRoute>
        ),
      },
    ],
  },
]);
