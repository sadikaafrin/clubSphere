import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import UpdatePlantForm from '../Form/UpdatePlantForm'

const UpdateEventModal = ({ setIsEditModalOpen, isOpen, event }) => {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10"
      onClose={() => setIsEditModalOpen(false)}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white p-6 shadow-xl rounded-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-red-100 px-3 py-1 rounded-md text-red-500"
              >
                X
              </button>
            </div>

            <DialogTitle className="text-lg font-medium text-center">
              Update Plant Info
            </DialogTitle>
<UpdatePlantForm event={event} setIsEditModalOpen={setIsEditModalOpen} />
            {/* <UpdatePlantForm event={event} /> */}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default UpdateEventModal
