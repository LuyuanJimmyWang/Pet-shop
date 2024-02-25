# Pet Shop DApp Setup Guide

This guide will walk you through the setup process for running the Pet Shop decentralized application (DApp) locally on your machine. The DApp allows users to adopt pets using blockchain technology.

## Required Software and Packages

- **Node.js**: Version 18.16.1
- **lite-server**: Version 2.6.1
- **solc**: Version 0.5.0
- **web3**: Version 4.1.0
- **truffle**: Version 5.11.2
- **Ganache**: Version 2.7.1

## Setup Instructions

1. Install Node.js and npm from [here](https://nodejs.org/en).
2. Install Git from [here](https://git-scm.com/).
3. Install Ganache from [here](https://trufflesuite.com/ganache/).
4. Install Metamask from [here](https://metamask.io/download/).

### Installation Steps

1. Clone this repository to your local machine:

 ```bash
 git clone https://github.com/your-username/pet-shop.giNavigate to the cloned repository:
 ```

2. Navigate to the cloned repository:
  ```bash
  cd pet-shop
  ```

3. Install dependencies:


  ```bash
  npm install web3
  npm install -g truffle
  npm install -g solc
  npm install --global lite-server
  ```
4. Start Ganache and connect it to Metamask by entering the 12-word Secret Recovery Phrase in Ganache.

  Add a network in Metamask with the following details: 
  
  RPC server: HTTP://127.0.0.1:7545 \
  Chain ID: 1337

5.Compile and migrate the contracts:

  ```bash
  truffle compile
  truffle migrate
  ```

6.Start the development server:

  ```bash
  npm run dev
  ```

7.Open your browser and navigate to http://localhost:3000 to view the Pet Shop DApp.
