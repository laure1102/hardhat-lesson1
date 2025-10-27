const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {devlopmentChains} = require("../../const-config")

devlopmentChains.includes(network.name)
? describe.skip
: describe("test fundme contract", async ()=>{
    let fundMeFactory;
    let fundMe;
    let fundMeWithSecondAccount;
    let firstAccount, secondAccount;
    let contractAddr;
    // before(async ()=>{
    //     console.log(`before test.`);
    //     fundMeFactory = await ethers.getContractFactory("FundMe");
    //     fundMe = await fundMeFactory.deploy(500);
    //     await fundMe.waitForDeployment();
    //     contractAddr = fundMe.target;
    //     [firstAccount, secondAccount] = await ethers.getSigners();
    // });
    // after(async ()=>{
    //     console.log(`after test...`);
    // });
    beforeEach(async ()=>{
      console.log(`beforeEach`);
      firstAccount = (await getNamedAccounts()).firstAccount;
      secondAccount = (await getNamedAccounts()).secondAccount;
      await deployments.fixture(["all"]); //使用tags复用deploy部署脚本进行部署
      const fundMeDeployment = await deployments.get("FundMe");
      contractAddr = fundMeDeployment.address;
      fundMe = await ethers.getContractAt("FundMe",contractAddr);
      fundMeWithSecondAccount = await ethers.getContract("FundMe",secondAccount);
    });
    // test fund and getFund successfully
    it("fund and getFund successfully", 
        async function() {
            // make sure target reached
            await fundMe.fund({value: ethers.parseEther("0.5")}) // 3000 * 0.5 = 1500
            // make sure window closed
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            // make sure we can get receipt 
            const getFundTx = await fundMe.getFund()
            const getFundReceipt = await getFundTx.wait()
            expect(getFundReceipt)
                .to.be.emit(fundMe, "FundWithdrawByOwner")
                .withArgs(ethers.parseEther("0.5"))
        }
    )
    // test fund and refund successfully
    it("fund and refund successfully",
        async function() {
            // make sure target not reached
            await fundMe.fund({value: ethers.parseEther("0.1")}) // 3000 * 0.1 = 300
            // make sure window closed
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            // make sure we can get receipt 
            const refundTx = await fundMe.refund()
            const refundReceipt = await refundTx.wait()
            expect(refundReceipt)
                .to.be.emit(fundMe, "RefundByFunder")
                .withArgs(firstAccount, ethers.parseEther("0.1"))
        }
    )
});