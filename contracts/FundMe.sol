// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


// 1 创建一个收款函数
// 2 记录投资人，并且查看
// 3 在锁定期内，达到目标值，生产商就可以提款
// 4 在锁定期内，没有达到目标值， 投资人在锁定期结束后可以退款

contract FundMe {
    mapping(address => uint256)  public fundersAmountMapp;

    uint256 constant MIN_VAL = 1 * 10 ** 18; //wei
    uint256 constant MIN_VAL_USD = 1 * 10 ** 18; //USD
    uint256 constant TARGET = 1000 * 10 ** 18; // TARGET USD
    uint256 deploymentTimestamp;
    uint256  lockTime;

    address public owner; //合约的所有者，getFund时，只有所有者能拿钱

    uint256 public testVal;

    AggregatorV3Interface internal dataFeed;
  
    constructor(uint256 _lockTime){
        // Sepolia Testnet
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        ); 
        // ETH/USD
        //https://docs.chain.link/data-feeds/price-feeds/addresses?page=1&testnetPage=1&network=ethereum&search=

        owner = msg.sender; //部署时的sender就是所有者
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    event FundMeEvent(
        uint256 indexed newVal,
        uint256 indexed oldVal,
        address indexed sender,
        uint256 timestamp
    );

    function testEvent(uint256 _testVal) public{
        emit FundMeEvent(_testVal, testVal, msg.sender, block.timestamp);
        testVal = _testVal;
    }


    function fund() external payable windowOpen{
        require(convertEthToUSD(msg.value) >= MIN_VAL_USD, "required more eth"); // 校验, revert
        fundersAmountMapp[msg.sender] = msg.value;
    }

     /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUSD(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function getFund() external windowClose onlyOwner{
        address currentAddr = address(this); //当前合约的地址
        uint256 balance = currentAddr.balance; //获取当前合约的余额
        uint256 balanceUsd = convertEthToUSD(balance); //转换成USD
        require(balanceUsd >= TARGET, "not reach target");

        //提钱，转账
        //1 transfer 纯转账， transfer eth and revert if tx failed
        // payable(msg.sender).transfer(balance); 
        //2 send 纯转账, transfer eth ,return bool
        // bool rslt = payable(msg.sender).send(balance);

        //3 call 转账+数据 ，建议使用call（所有情况使用）, return value of function and bool
        (bool success, ) = payable(msg.sender).call{value: balance}(""); //转账
        require(success, "call failed");
    }   

    function transferOwnerShip(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    function reFund() external windowClose{ //退款
        address currentAddr = address(this); //当前合约的地址
        uint256 balance = currentAddr.balance; //获取当前合约的余额
        uint256 balanceUsd = convertEthToUSD(balance); //转换成USD
        require(balanceUsd < TARGET, "target is reached!");
        
        uint256 amount = fundersAmountMapp[msg.sender];
        require(amount > 0, "you do not have amount!");
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "transfer call failed!");
        fundersAmountMapp[msg.sender] = 0;
    }

    modifier windowOpen(){
        require(block.timestamp <= deploymentTimestamp + lockTime, "lock time over");
        _;
    }

    modifier windowClose(){
        require(block.timestamp > deploymentTimestamp + lockTime, "lock time not end");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender==owner, "this function can only call by owner!");
        _;
    }
}