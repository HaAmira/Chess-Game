// import React from 'react'

import Socket_con from "./Components/Socket_con"
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <div>
      <Toaster />
      <Socket_con/>
    </div>
  )
}

export default App