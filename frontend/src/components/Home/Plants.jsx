import Card from "./Card";
import Container from "../Shared/Container";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import LoadingSpinner from "../Shared/LoadingSpinner";
import heroImg from "../../assets/images/hero.jpg";

const Plants = () => {
  // const { data: plants = [], isLoading } = useQuery({
  //   queryKey: ["plants"],
  //   queryFn: async () => {
  //     const result = await axios(`${import.meta.env.VITE_API_URL}/plants`);
  //     return result.data;
  //   },
  // });
  // if (isLoading) return <LoadingSpinner></LoadingSpinner>;
  return (
    <div>
      <div
        className="min-h-screen w-full bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="hero-overlay bg-black/40 absolute inset-x-0 "></div>

        <div className="container mx-auto px-4 relative z-10 left-20 top-10">
          <div className="max-w-md text-[#ffffff]">
            <div>
              <h1 className="mb-5 text-4xl md:text-5xl font-bold ">
                FREE BODY TRANSFORMATION ROADMAP CALL
              </h1>
              <p className="mb-5 text-xl">
                Create a plan that fits your lifestyle.
              </p>
            </div>
            <button className="btn btn-primary btn-lg bg-[#ff1010]">Get Started</button>
          </div>
        </div>
      </div>
      </div>
  );
};

export default Plants;
