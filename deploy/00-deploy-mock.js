const {MOCK_DECIMAL, MOCK_INITIAL_ANSWER} = require('../const-config');
module.exports = async ({getNamedAccounts, deployments})=>{
    switch(network.name ){
        case "hardhat":
        case "local":
            const {deploy} = deployments;
            const {firstAccount} = await getNamedAccounts();
            await deploy("MockV3Aggregator",{
                from: firstAccount,
                args:[MOCK_DECIMAL, MOCK_INITIAL_ANSWER],
                log: true,
            });
            console.log(`deploy MockV3Aggregator success!`);
            break;
        default:
            console.log(`not local env, skip deploy MockV3Aggregator`);
            return;
    }
}

module.exports.tags = ['all','mock']; //在执行时参数tags为数组中的任一tag时，本脚本执行
