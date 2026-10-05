// import React from 'react'

import Navbar from "./Components/Navbar";
import Socket_con from "./Components/Socket_con"
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <div>
      <Toaster />
      <Navbar/>
      <Socket_con/>
    </div>
  )
}

export default App