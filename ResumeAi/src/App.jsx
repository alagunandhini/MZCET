import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import './index.css'
import Home from './pages/Home';
import Resume from './pages/Resume';
import Resources from './pages/Resources';
import Footer from './components/Footer';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import Feedback from './pages/Feedback';


function App() {
  return (
    <>
    
   
    <div className='min-h-screen w-full overflow-x-hidden'>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/resume' element={<Resume/>}/>
      <Route path='/resources' element={<Resources/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/set-password' element={<SetPassword/>}/>
        <Route path='/feedback/:sessionId' element={<Feedback/>}/>


      </Routes>

    </div>
    
   
   
   

    </>
  )
}

export default App
