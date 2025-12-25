import { FaUserAstronaut, FaUserCog } from 'react-icons/fa'
import MenuItem from './MenuItem'

const AdminMenu = () => {
  return (
    <>
      <MenuItem icon={FaUserCog} label='Manage Users' address='manage-users' />
      <MenuItem  icon={FaUserAstronaut} label='All Users' address='seller-request' />
      <MenuItem  icon={FaUserAstronaut} label='All Event' address='all-event' />
      <MenuItem  icon={FaUserAstronaut} label='All Membership User' address='all-membership-user' />
      <MenuItem  icon={FaUserAstronaut} label='All Club' address='all-club-approval' />
    </>
  )
}

export default AdminMenu
