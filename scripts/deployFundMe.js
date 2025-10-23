//1 import ethers.js
const {ethers} = require("hardhat");

async function deploy(param1){
    // create the factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log(`contract deploying!`);
    // deploy the contract
    const fundMe = await fundMeFactory.deploy(param1);
    await fundMe.waitForDeployment();
    console.log(`contract deployed success!`);
    console.log(`contract address is ${fundMe.target}`);
    return fundMe;
}

async function verify(contractAddress,param1){
    console.log(`to verify addr at :${contractAddress}`);
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
            param1
        ],
    });
}

//2 create main function
async function main(){
    const param1 = 500;
    const fundMe = await deploy(param1);
    const addr = fundMe.target;
    if(hre.network.config.chainId==11155111 && !!process.env.ETHERSCAN_API_KEY){
        console.log(`wait deployment transaction 5 block confirmed`);
        await fundMe.deploymentTransaction().wait(5);
        await verify(addr, param1);
    }else{
        console.log(`verify skipped`);
    }

    
    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // fund contract with 1st account
    //默认使用数组第一个账户，不用connect
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.02")});
    await fundTx.wait();

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`balanceOfContract: ${balanceOfContract}`);

    // fund contract with 2nd account
    const fundTx2 = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.01")});
    await fundTx2.wait();

    // check balance of contract
    const balanceOfContract2 = await ethers.provider.getBalance(fundMe.target);
    console.log(`balanceOfContract: ${balanceOfContract2}`);

    // check mapping
    const firstAccountBalanceInMap = await fundMe.fundersAmountMapp(firstAccount.address);
    const secondAccountBalanceInMap = await fundMe.fundersAmountMapp(secondAccount.address);

    console.log(`firstAccountBalanceInMap:${firstAccountBalanceInMap}`);
    console.log(`secondAccountBalanceInMap:${secondAccountBalanceInMap}`);

    
}
//3 exec the main function

main().then().catch((err)=>{
    console.error(err);
    process.exit(1);
});
