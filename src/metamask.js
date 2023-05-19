import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';

function App() {
	const [haveMetamask, sethaveMetamask] = useState(true);

	const [accountAddress, setAccountAddress] = useState('');
	const [accountBalance, setAccountBalance] = useState('');

	const [isConnected, setIsConnected] = useState(false);

	const { ethereum } = window;

	const provider = new ethers.providers.Web3Provider(window.ethereum);

	useEffect(() => {

		const { ethereum } = window;
		const checkMetamaskAvailability = async () => {
			if (!ethereum) {
				sethaveMetamask(false);
			}
			sethaveMetamask(true);
		};
		checkMetamaskAvailability();
	}, []);

	const connectWallet = async () => {
		try {
			if (!ethereum) {
				sethaveMetamask(false);
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			let balance = await provider.getBalance(accounts[0]);
			let bal = ethers.utils.formatEther(balance);

			setAccountAddress(accounts[0]);
			setAccountBalance(bal);
			setIsConnected(true);
		} catch (error) {
			setIsConnected(false);
		}
	};
	return (
		<div className="App">
			<header className="App-header">
				{haveMetamask ? (
					<div className="App-header">
						{isConnected ? (
							<div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Address</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>
											{accountAddress.slice(0, 4)}...
											{accountAddress.slice(38, 42)}
										</p>
									</div>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between" }}>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>Balance</p>
									</div>
									<div>
										<p style={{ color: "white", fontSize: "20px" }}>{accountBalance}</p>
									</div>
								</div>
							</div>
						) : ""}

						{isConnected ? (
							""
						) : (
							<Button variant="dark" onClick={connectWallet} style={{borderRadius: "0px", marginBottom: "10px"}}>Connect Wallet</Button>
						)}
					</div>
				) : (
					<p>Please Install MataMask</p>
				)}
			</header>
		</div>
	);
}

export default App;

