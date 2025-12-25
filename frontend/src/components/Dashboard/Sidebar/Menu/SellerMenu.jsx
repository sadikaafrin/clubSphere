import { BsFillHouseAddFill } from 'react-icons/bs'
import { MdHomeWork, MdOutlineManageHistory } from 'react-icons/md'
import MenuItem from './MenuItem'
const SellerMenu = () => {
  return (
    <>
      <MenuItem
        icon={BsFillHouseAddFill}
        label='Add Club'
        address='add-club'
      />
      <MenuItem
        icon={BsFillHouseAddFill}
        label='Add Event'
        address='add-event'
      />
      <MenuItem icon={MdHomeWork} label='My Club' address='my-club' />
      <MenuItem icon={MdHomeWork} label='My Events' address='my-events' />
      <MenuItem
        icon={MdOutlineManageHistory}
        label='Manage Orders'
        address='manage-orders'
      />
    </>
  )
}

export default SellerMenu
