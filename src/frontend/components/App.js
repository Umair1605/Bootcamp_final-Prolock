import {BrowserRouter,Routes,Route} from "react-router-dom";
import PropertyPlaceAbi from '../contractsData/PropertyPlace.json'
import PropertyPlaceAddress from '../contractsData/PropertyPlace-address.json'
import Navbar from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedProperties from './MyListedProperties.js'
import MyPurchases from './MyPurchases.js'
import { useState,useEffect } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'
import './App.css';
 
function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [propertyplace, setPropertyplace] = useState({})
  
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
    loadContracts(signer)
  }
  // load Contracts
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const propertyplace = new ethers.Contract(PropertyPlaceAddress.address, PropertyPlaceAbi.abi, signer)
    setPropertyplace(propertyplace)
    setLoading(false)
  }

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()   
    loadContracts(signer)
  }, [])
  

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navbar web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home propertyplace={propertyplace} account={account} />
              } />
              <Route path="/create" element={
                <Create propertyplace={propertyplace}  account={account} />
              } />
              <Route path="/my-listed-properties" element={
                <MyListedProperties propertyplace={propertyplace} account={account} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases propertyplace={propertyplace} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
