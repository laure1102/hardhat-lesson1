const {task} = require("hardhat/config");
task("deploy-fundMe","deploy ...").setAction(async(taskArgs, hre)=>{
    const param1 = 500;
    const fundMe = await deploy(hre, param1);
    const addr = fundMe.target;
    if(hre.network.config.chainId==11155111 && !!process.env.ETHERSCAN_API_KEY){
        console.log(`wait deployment transaction 5 block confirmed`);
        await fundMe.deploymentTransaction().wait(5);
        await verify(hre, addr, param1);
    }else{
        console.log(`verify skipped`);
    }
});

async function deploy(hre, param1){
    // create the factory
    const fundMeFactory = await hre.ethers.getContractFactory("FundMe");
    console.log(`contract deploying!`);
    // deploy the contract
    const fundMe = await fundMeFactory.deploy(param1);
    await fundMe.waitForDeployment();
    console.log(`contract deployed success!`);
    console.log(`contract address is ${fundMe.target}`);
    return fundMe;
}

async function verify(hre, contractAddress,param1){
    console.log(`to verify addr at :${contractAddress}`);
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
            param1
        ],
    });
}

module.exports = {};