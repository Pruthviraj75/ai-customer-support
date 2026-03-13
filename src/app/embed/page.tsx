import EmbedClient from '@/components/EmbedClient';
import { getSession } from '@/lib/getSession'
import React from 'react'

const page = async () => {
    const session = await getSession();
    const ownerId = session?.user?.id
  if(!ownerId){
    return <div>Unauthorized</div>
  }

  return (
    <>
      <EmbedClient ownerId={ownerId}/>
    </>
  )
}

export default page
