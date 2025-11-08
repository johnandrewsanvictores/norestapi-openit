import React from 'react'
import PublicLayout from '../layout/PublicLayout'
import Mapbox from '../section/Mapbox.jsx'

function Homepage() {
  return (
    <PublicLayout>
        <div className=' bg-red-700'>This is the home page</div>
        <Mapbox />
    </PublicLayout>
  )
}

export default Homepage