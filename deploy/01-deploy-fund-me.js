const {networkConfig, lock_time} = require("../const-config");

module.exports = async ({getNamedAccounts, deployments})=>{
    const {deploy} = deployments;
    const {firstAccount} = await getNamedAccounts();
    let dataFeedAddr = "";
    console.log(`current network.name : ${network.name}`);
    switch(network.name){
        case "hardhat": //本地地址,部署一次就消失
        case "local": //本地地址，部署后一直存在
            //MOCK 汇率合约地址
            const mockDataFeed = await deployments.get("MockV3Aggregator");
            dataFeedAddr = mockDataFeed.address;
            break;
        default:
            dataFeedAddr = networkConfig[network.name].dataFeed;
            break;
    }
    console.log(`dataFeedAddr:${dataFeedAddr}`);
    const param1 = [lock_time, dataFeedAddr];
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args:param1,
        log: true,
    });
    console.log(`deploy fundme success!`);

    if(network.name=="sepolia" && !!process.env.ETHERSCAN_API_KEY){
        console.log(`to verify addr at :${fundMe.address}`);
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: param1,
        });
    }else{
        console.log(`verify skipped`);
    }

    
}

module.exports.tags = ['all','fundme']; //在执行时参数tags为数组中的任一tag时，本脚本执行
