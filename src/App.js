import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';


const App = () => {
  /*
   * All state property to store all waves
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentMess, setCurrentMess] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x6740Ebc8A17f3c227DA7567E2C914F88ddA1AA18";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

     const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * This runs our function when the page loads.
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum && currentMess) {
        let count;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      
                /*
        * Execute the actual wave from your smart contract
        */
                const waveTxn = await wavePortalContract.wave(currentMess,{ gasLimit: 300000 });  
                console.log("Mining...", waveTxn.hash);
        
                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);
                console.log("Message sent: ", currentMess);
                count = await wavePortalContract.getTotalWaves();
        
                console.log("Retrieved total wave count...", count.toNumber());
                await getAllWaves()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;
    checkIfWalletIsConnected();
  
    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, [contractABI]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 👋 I'm Jose and learning about web3 👋🍑!
        </div>

        <div className="Slap">
        <button onClick={wave}>Slap my 🍑🍑 and send me a message!!</button>
        </div>
        <input onChange={e => setCurrentMess(e.target.value)} placeholder="Send message with the 👋!!" />
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {!currentAccount && ( 
        <div className="permission">
         If you want to slap it 🍑🍑 , but you must connect your wallet first!!<br />
         You know you want to!!
         </div> 
        )}

        <div className ="history">
        {allWaves.map((wave, index) => {
           return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div> 
      
      </div> 
      </div>
      );
      }

export default App;
