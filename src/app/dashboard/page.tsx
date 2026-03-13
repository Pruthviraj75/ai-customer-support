import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import React from 'react'

const page = async () => {
  const session = await getSession()
  const ownerId = session?.user?.id
  if(!ownerId){
    return <div>Unauthorized</div>
  }
  return (
    <>
       <DashboardClient ownerId={ownerId}/>      
    </>
  )
}

export default page
