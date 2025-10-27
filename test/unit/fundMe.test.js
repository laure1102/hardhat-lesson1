//describe(title, callback): 作用：把一组相关的测试用例（或嵌套子分组）打包成一个“测试套件”。
//it(title, callback): 定义一条测试用例
/**
 * 
 * 钩子一览
before(fn)        – 当前套件所有用例开始前运行一次
after(fn)         – 当前套件所有用例结束后运行一次
beforeEach(fn)    – 每个 it 前都运行一次
afterEach(fn)     – 每个 it 后都运行一次
 */

/**
describe('计算器', function () {
  let calc;          // 套件级共享变量

  before(function () {
    console.log('before: 实例化计算器');
    calc = new Calculator();   // 耗时初始化只跑一次
  });

  after(function () {
    console.log('after: 释放资源');
    calc.shutdown();
  });

  beforeEach(function () {
    console.log('beforeEach: 清零');
    calc.clear();
  });

  afterEach(function () {
    console.log('afterEach: 清空历史');
    calc.history = [];
  });

  describe('#add()', function () {
    it('should return 42 when 40 + 2', function () {
      assert.strictEqual(calc.add(40, 2), 42);
    });

    it('should return 0 when -1 + 1', function () {
      assert.strictEqual(calc.add(-1, 1), 0);
    });
  });
});

运行顺序
before
  beforeEach → it → afterEach
  beforeEach → it → afterEach
after
 */

const {ethers, deployments, getNamedAccounts} = require("hardhat");
const {assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("test fundme contract", async ()=>{
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
    it("test if the owner is msg.sender",async ()=>{
        await assert.equal((await fundMe.owner()), firstAccount);
    });
    it("test if the owner is not msg.sender",async ()=>{
        await assert.notEqual((await fundMeWithSecondAccount.owner()), secondAccount);
    });

    //unit test for fund function
    it("window closed,value grater than minum, fund failed", async()=>{
      //本地网络时间戳不会自动增加
      //make sure the window is closed
      await helpers.time.increase(200);
      await helpers.mine();//模拟挖矿
      await expect(fundMe.fund({value: ethers.parseEther("0.001")}))
      .to.be.revertedWith("lock time over");

    });
    it("window open, value less than minum, fund failed",async()=>{
      await expect(fundMe.fund({value: ethers.parseEther("0.00001")}))
      .to.be.revertedWith("required more eth");
    });

    it("fund success", async()=>{
      await helpers.time.increase(100);
      await helpers.mine();//模拟挖矿
      await fundMe.fund({value: ethers.parseEther("0.002")});
      fundedAmount = await fundMe.fundersAmountMapp(firstAccount);
      // assert.equal(fundedAmount, 0.002*(10**18));
      await expect(fundedAmount).to.equal(ethers.parseEther("0.002"));
    });

});