import { Link } from 'react-router'

const Card = ({club}) => {
  const {_id, name, image, category, quantity, price, location} = club || {}
  return (
     <Link to={`/clubs/${_id}`} className='col-span-1 cursor-pointer group shadow-xl p-3 rounded-xl'>
      <div className="card bg-base-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

        {/* Image Section */}
        <figure className="relative h-60 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Category */}
          <span className="absolute top-4 left-4 badge badge-secondary font-medium">
            {category}
          </span>

          {/* Price */}
          <span className="absolute bottom-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            ${price}
          </span>
        </figure>

        {/* Card Body */}
        <div className="card-body p-5">
          <h2 className="text-lg font-bold text-gray-800 group-hover:text-primary transition">
            {name}
          </h2>

          <p className="text-sm text-gray-500 flex items-center gap-1">
            📍 {location}
          </p>

          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              Available: <span className="font-semibold">{quantity}</span>
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-medium
              ${quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            `}>
              {quantity > 0 ? "Open" : "Full"}
            </span>
          </div>

          {/* Action */}
          <div className="card-actions mt-4">
            <button className="btn btn-primary btn-sm w-full tracking-wide">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Card
