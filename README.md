# [dapp_digitalItems](https://github.com/zombietimes/dapp_digitalItems)
This is a sample application of DApps.  

## Overview
[dapp_digitalItems](https://github.com/zombietimes/dapp_digitalItems) allows generating and trading your own digital items on the blockchain.  
This is based ERC1155 in [openzeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts).  

## Description
Let's run and analyze the sample DApps.  
You can understand deeply by editing the sample code.  
I think that it is worth learning the smart contract development.  
I focus on Ethereum and Loom Network as the DApps.  
- [Truffle : Official](https://truffleframework.com/)  
- [Ganache : Official](https://truffleframework.com/docs/ganache/overview)  
- [Loom Network SDK : Official](https://loomx.io/developers/)  

### Setting up the development environment.
The script file [setup0000_all](https://github.com/zombietimes/setup0000_all) is useful to set up the development environment.  
It consists of the external script files below.  
- [setup0000_all](https://github.com/zombietimes/setup0000_all)  
  
This script file is for Ubuntu(Linux).  
I recommend that you use VirtualBox + Ubuntu.  

## Usage
### Local webserver
[dapp_digitalItems](https://github.com/zombietimes/dapp_digitalItems) requires a local webserver.  
Google local server is very convenient.  
![dapp_digitalItems_0000](https://user-images.githubusercontent.com/50263232/116646317-aefcad80-a9b2-11eb-963d-5e89ec2c3519.png)  

### Preparation
[dapp_digitalItems](https://github.com/zombietimes/dapp_digitalItems) generates two accounts via web3.js and 
allows sending Ether from a Ganache account.  
It is useful for development.  
  
At first, press the Ready button.  
![dapp_digitalItems_0001](https://user-images.githubusercontent.com/50263232/116646343-c0de5080-a9b2-11eb-9343-8182fed7d1d4.png)  
  
And then, import a Ganache account to the client.  
Copy and paste the address and private key of the Ganache account, press the Import button.  
![dapp_digitalItems_0002](https://user-images.githubusercontent.com/50263232/116646371-d2275d00-a9b2-11eb-876c-99e59ff39cb9.png)  
  
![dapp_digitalItems_0003](https://user-images.githubusercontent.com/50263232/116646388-e10e0f80-a9b2-11eb-8bdf-df26c2fba8a7.png)  
  
Press the Send button.  
The balance of PlayerP and PlayerQ is updated.  
![dapp_digitalItems_0004](https://user-images.githubusercontent.com/50263232/116646413-ef5c2b80-a9b2-11eb-8e79-e9605b11e847.png)  
  
![dapp_digitalItems_0005](https://user-images.githubusercontent.com/50263232/116646427-fdaa4780-a9b2-11eb-9674-ca9698817716.png)  

### Trading digital items
At first, PlayerP creates ItemA.  
![dapp_digitalItems_0006](https://user-images.githubusercontent.com/50263232/116646460-1155ae00-a9b3-11eb-8f46-d71fed7126ea.png)  
  
And then, PlayerQ deposits to [dapp_digitalItems](https://github.com/zombietimes/dapp_digitalItems) for payments.
![dapp_digitalItems_0007](https://user-images.githubusercontent.com/50263232/116646480-203c6080-a9b3-11eb-8cc4-6357531a299d.png)  
  
PlayerP requests an order for selling ItemA.  
![dapp_digitalItems_0008](https://user-images.githubusercontent.com/50263232/116646495-2d594f80-a9b3-11eb-913a-6677b67960e6.png)  
  
PlayerQ requests an order for buying ItemA.  
![dapp_digitalItems_0009](https://user-images.githubusercontent.com/50263232/116646513-38ac7b00-a9b3-11eb-9064-bcd162d90b70.png)  
  
Press the Buy button.  
![dapp_digitalItems_0010](https://user-images.githubusercontent.com/50263232/116646538-48c45a80-a9b3-11eb-8bb3-7fbfcde521fb.png)  
  
![dapp_digitalItems_0011](https://user-images.githubusercontent.com/50263232/116646557-54178600-a9b3-11eb-95b6-92cc1e74fb7b.png)  
  
PlayerQ got ItemA.  
![dapp_digitalItems_0012](https://user-images.githubusercontent.com/50263232/116646594-6db8cd80-a9b3-11eb-9507-7fcb1dfda8b7.png)  
  
PlayerP got Ether.  
![dapp_digitalItems_0013](https://user-images.githubusercontent.com/50263232/116646642-8a550580-a9b3-11eb-9671-60cd309b11ee.png)  

## Relative link
### Overview
- [Ethereum : Official](https://www.ethereum.org/)
- [Ethereum : Wikipedia](https://en.wikipedia.org/wiki/Ethereum)
- [Loom Network : Official](https://loomx.io/)
- [Loom Network : Binance wiki](https://info.binance.com/en/currencies/loom-network)

### Development
- [Online editor : EthFiddle](https://ethfiddle.com/)
- [Online editor : Remix](https://remix.ethereum.org/)

### Learning
- [Online learning : CryptoZombies](https://cryptozombies.io/)
- [Grammar : Solidity](https://solidity.readthedocs.io/)
- [Grammar : Best Practices](https://github.com/ConsenSys/smart-contract-best-practices)

### DApps
- [DApps : CryptoKitties](https://www.cryptokitties.co/)
- [DApps : Zombie Battle ground](https://loom.games/en/)

## Messages
Do you believe that the decentralized world is coming?  
When do you use [DApps](https://en.wikipedia.org/wiki/Decentralized_application)?  
Why?  

## License
BSD 3-Clause, see `LICENSE` file for details.  

