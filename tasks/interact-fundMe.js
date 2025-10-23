const {task} = require("hardhat/config");
task("interact-fundMe","hahhhh")
    .addParam("addr","FundMe contract addr")
    .setAction(async(taskArgs, hre)=>{
    const ethers = hre.ethers;
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.attach(taskArgs.addr);
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
});

module.exports = {};