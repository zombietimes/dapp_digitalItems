// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "../openzeppelin-solidity/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract OnOrder is ERC1155Holder {
    DigitalItems private s_digitalItems; 
    constructor() {
    }
    function Init(DigitalItems digitalItems) public {
        s_digitalItems = digitalItems;
    }
    function Item_SendTo(address xPeer, uint256 idItem, uint32 amountItem) public {
        s_digitalItems.setApprovalForAll(xPeer,true);
        s_digitalItems.safeTransferFrom(address(this), xPeer, idItem, amountItem, "0x0");
    }
    function Item_RecvFrom(address xOwner, uint256 idItem, uint32 amountItem) public {
        s_digitalItems.safeTransferFrom(xOwner, address(this), idItem, amountItem, "0x0");
    }
}

contract DigitalItems is ERC1155 {
    address private s_xDeployer;
    OnOrder private s_onOrder;
    
    constructor() ERC1155("https://github.com/zombietimes") {
        require(msg.sender != address(0));
        s_xDeployer = msg.sender;
        s_onOrder = new OnOrder();
        s_onOrder.Init(this);
    }

    mapping(uint256 => ItemInfo) public s_items;
    
    function Item_Create(uint32 amountItem, string memory name) public {
        uint256 idItem = Item_GetIdItem(msg.sender, name);
        require(s_items[idItem].creater == address(0x0), "[ERR]Already exist.");
        s_items[idItem].creater = msg.sender;
        s_items[idItem].name = name;
        _mint(msg.sender, idItem, amountItem, "");
    }
    function Item_GetIdItem(address xCreater, string memory name) public pure returns(uint256) {
        uint256 idItem = uint256(keccak256(abi.encodePacked(xCreater, name)));
        return idItem;
    }
    function Item_Add(uint256 idItem, uint32 amountItem) public {
        require(s_items[idItem].creater == msg.sender, "[ERR]Not creater.");
        _mint(msg.sender, idItem, amountItem, "");
    }
    function Item_Remove(uint256 idItem, uint32 amountItem) public {
        require(s_items[idItem].creater == msg.sender, "[ERR]Not creater.");
        _burn(msg.sender, idItem, amountItem);
    }
    function Item_GetBalance(address xOwner, uint256 idItem) public view returns(uint256) {
        uint256 balance = balanceOf(xOwner, idItem);
        return balance;
    }

    mapping(address => uint256) public s_balances;
    function Wei_Deposit() public payable {
        require(msg.sender != address(0));
        s_balances[msg.sender] += msg.value;
    }
    function Wei_Withdraw() public payable {
        require(msg.sender != address(0));
        uint256 balance = s_balances[msg.sender];
        if(balance > 0){
            s_balances[msg.sender] = 0;
            payable(msg.sender).transfer(balance);
        }
    }
    function Wei_GetBalance(address xOwner) public view returns(uint256) {
        uint256 balance = s_balances[xOwner];
        return balance;
    }
    
    uint8 constant ORDER_KIND_SELL = 0;
    uint8 constant ORDER_KIND_BUY = 1;
    uint8 constant ORDER_KIND_NUM = 2;
    struct Order {
        address xOwner;
        uint32 amountItem;
    }
    struct OrderInfo {
        uint32 indexStart;
        Order[] orderList;
    }
    struct PriceInfo {
        OrderInfo[ORDER_KIND_NUM] orderInfo;
    }
    struct ItemInfo {
        address creater;
        string name;
        mapping(uint256 => PriceInfo) prices;
    }
    function AddOrderSell(uint256 idItem, uint32 price, uint32 amountItem) public fromSender(idItem, amountItem) {
        item_fromSenderToOnOrder(idItem, amountItem);
        s_items[idItem].prices[price].orderInfo[ORDER_KIND_SELL].orderList.push(Order(msg.sender, amountItem));
        setApprovalForAll(address(s_onOrder),true);
    }
    function AddOrderBuy(uint256 idItem, uint32 price, uint32 amountItem) public {
        uint256 amountWei = amountItem * price;
        require(s_balances[msg.sender] >= amountWei, "[ERR]Not enough wei.");   
        wei_fromSenderToOnOrder(amountWei);
        s_items[idItem].prices[price].orderInfo[ORDER_KIND_BUY].orderList.push(Order(msg.sender, amountItem));
        setApprovalForAll(address(s_onOrder),true);
    }
    function GetOrderInfo(uint256 idItem, uint32 price, uint8 orderKind) public view returns(uint32 indexStart, uint32 listLen) {
        OrderInfo memory orderInfo = s_items[idItem].prices[price].orderInfo[orderKind];
        indexStart = orderInfo.indexStart;
        listLen = uint32(orderInfo.orderList.length);
    }
    function GetOrder(uint256 idItem, uint32 price, uint8 orderKind, uint32 indexOrder) public view returns(address xOwner, uint32 amountItem){
        OrderInfo memory orderInfo = s_items[idItem].prices[price].orderInfo[orderKind];
        xOwner = orderInfo.orderList[indexOrder].xOwner;
        amountItem = orderInfo.orderList[indexOrder].amountItem;
    }
//    function CancelOrder() public {
//        //@todo
//        // amount:0
//        // Wei : xOnOrder > msg.sender
//        // Item : xOnOrder > msg.sender
//    }
    modifier fromSender(uint256 idItem, uint32 amountItem) {
        uint256 amountItemBefore = balanceOf(msg.sender, idItem);
        require(amountItemBefore >= amountItem, "[ERR]Not enough Item.");
        _;
    }

    uint8 constant SELF_KIND_SELLER = 0;
    uint8 constant SELF_KIND_BUYER = 1;
    struct AgreeOrder {
        uint256 idItem;
        uint32 price;
        uint8 selfKind;
        uint8 orderKindSelf;
        uint32 indexOrderSelf;
        uint32 amountItemSelf;
        uint8 orderKindPeer;
        uint32 indexOrderPeer;
        uint32 amountItemPeer;
    }
    function TryAgreeOrders(uint256 idItem, uint32 price, uint8 orderKindSelf, uint32 indexOrderSelf, uint32 amountItemReqSelf) public {
        //@todo: fee - Everyone can run this transaction.
        AgreeOrder memory agreeOrder;
        agreeOrder.idItem = idItem;
        agreeOrder.price = price;
        agreeOrder.orderKindSelf = orderKindSelf;
        agreeOrder.indexOrderSelf = indexOrderSelf;
        OrderInfo storage s_orderInfoSelf = s_items[idItem].prices[price].orderInfo[orderKindSelf];
        agreeOrder.amountItemSelf = s_orderInfoSelf.orderList[indexOrderSelf].amountItem;
        require(amountItemReqSelf <= agreeOrder.amountItemSelf, "[ERR]Not enough item amount.");
        (agreeOrder.selfKind, agreeOrder.orderKindPeer) = analyzeOrderKindInfo(agreeOrder.orderKindSelf);
        OrderInfo storage s_orderInfoPeer = s_items[idItem].prices[price].orderInfo[agreeOrder.orderKindPeer];
        
        uint32 indexStartSelfNew = s_orderInfoSelf.indexStart;
        uint32 indexStartPeerNew = s_orderInfoPeer.indexStart;
        uint32 listLenSelf = uint32(s_orderInfoSelf.orderList.length);
        uint32 listLenPeer = uint32(s_orderInfoPeer.orderList.length);
        uint32 amountItemRemain = amountItemReqSelf;
        require(s_orderInfoPeer.indexStart < listLenPeer, "[ERR]No order.");
        for(agreeOrder.indexOrderPeer = s_orderInfoPeer.indexStart; agreeOrder.indexOrderPeer < listLenPeer; agreeOrder.indexOrderPeer += 1){
            agreeOrder.amountItemPeer = s_orderInfoPeer.orderList[agreeOrder.indexOrderPeer].amountItem;
            if(agreeOrder.amountItemPeer != 0){
                if(s_orderInfoSelf.orderList[agreeOrder.indexOrderSelf].xOwner != s_orderInfoPeer.orderList[agreeOrder.indexOrderPeer].xOwner){
                    uint32 amountItemDone = 0;
                    if(amountItemRemain <= agreeOrder.amountItemPeer){
                        amountItemDone = amountItemRemain;
                        amountItemRemain = 0;
                    }else{
                        amountItemDone = agreeOrder.amountItemPeer;
                        amountItemRemain = amountItemRemain - amountItemDone;
                    }
                    s_orderInfoSelf.orderList[agreeOrder.indexOrderSelf].amountItem -= amountItemDone;
                    s_orderInfoPeer.orderList[agreeOrder.indexOrderPeer].amountItem -= amountItemDone;
                    if(s_orderInfoSelf.orderList[agreeOrder.indexOrderSelf].amountItem == 0){
                        indexStartSelfNew = agreeOrder.indexOrderSelf + 1;
                    }
                    if(s_orderInfoPeer.orderList[agreeOrder.indexOrderPeer].amountItem == 0){
                        indexStartPeerNew = agreeOrder.indexOrderPeer + 1;
                    }
                    if(amountItemDone > 0){
                        trade(agreeOrder, amountItemDone, s_orderInfoSelf.orderList[agreeOrder.indexOrderSelf].xOwner, s_orderInfoPeer.orderList[agreeOrder.indexOrderPeer].xOwner);
                    }
                    if(amountItemRemain <= 0){
                        break;
                    }
                }
            }
        }
        if(indexStartSelfNew > s_orderInfoSelf.indexStart){
            for(agreeOrder.indexOrderSelf = s_orderInfoSelf.indexStart; agreeOrder.indexOrderSelf < listLenSelf; agreeOrder.indexOrderSelf += 1){
                if(s_orderInfoSelf.orderList[agreeOrder.indexOrderSelf].amountItem != 0){
                    break;
                }
            }
            if(agreeOrder.indexOrderSelf > s_orderInfoSelf.indexStart){
                s_items[idItem].prices[price].orderInfo[agreeOrder.orderKindSelf].indexStart = agreeOrder.indexOrderSelf;
            }
        }
        if(indexStartPeerNew > s_orderInfoPeer.indexStart){
            s_items[idItem].prices[price].orderInfo[agreeOrder.orderKindPeer].indexStart = indexStartPeerNew;
        }
    }
    function analyzeOrderKindInfo(uint8 orderKindSelf) private pure returns(uint8 selfKind, uint8 orderKindPeer) {
        if(orderKindSelf == ORDER_KIND_SELL){
            selfKind = SELF_KIND_SELLER;
            orderKindPeer = ORDER_KIND_BUY;
        } else if(orderKindSelf == ORDER_KIND_BUY){
            selfKind = SELF_KIND_BUYER;
            orderKindPeer = ORDER_KIND_SELL;
        } else {
            require((orderKindSelf == ORDER_KIND_SELL)||(orderKindSelf == ORDER_KIND_BUY), "[ERR]Invalid order kind.");
        }
    }
    event agreeInfo(uint8 selfKind, uint32 price, uint32 amountItemDone);
    function trade(AgreeOrder memory agreeOrder, uint32 amountItemDone, address xSelf, address xPeer) private {
        if(agreeOrder.selfKind == SELF_KIND_SELLER){
           wei_item_trade(agreeOrder.idItem, agreeOrder.price, amountItemDone, xSelf, xPeer);
        } else{
           wei_item_trade(agreeOrder.idItem, agreeOrder.price, amountItemDone, xPeer, xSelf);
        }
        emit agreeInfo(agreeOrder.selfKind, agreeOrder.price, amountItemDone);
    }
    function wei_item_trade(uint256 idItem, uint32 price, uint32 amountItem, address xSeller, address xBuyer) private {
        // Item : xOnOrder > xBuyer
        s_onOrder.Item_SendTo(xBuyer, idItem, amountItem);
        // Wei : xOnOrder > xSeller
        uint256 amountWei = amountItem * price;
        s_balances[address(s_onOrder)] -= amountWei;
        s_balances[xSeller] += amountWei;
    }
    function wei_fromSenderToOnOrder(uint256 amountWei) private {
        // Wei : msg.sender > xOnOrder
        s_balances[msg.sender] -= amountWei;
        s_balances[address(s_onOrder)] += amountWei;
    }
    function wei_fromOnOrderToSender(uint256 amountWei) private {
        // Wei : xOnOrder > msg.sender
        s_balances[address(s_onOrder)] -= amountWei;
        s_balances[msg.sender] += amountWei;
    }
    function item_fromSenderToOnOrder(uint256 idItem, uint32 amountItem) private {
        // Item : msg.sender > xOnOrder
        setApprovalForAll(address(s_onOrder),true);
        s_onOrder.Item_RecvFrom(msg.sender, idItem, amountItem);
    }
    function item_fromOnOrderToSender(uint256 idItem, uint32 amountItem) private {
        // Item : xOnOrder > msg.sender
        s_onOrder.Item_SendTo(msg.sender, idItem, amountItem);
    }

    event InfoAddress(address target);
    event InfoUint(uint256 target);
    function ShowInfo() public {
        emit InfoAddress(address(s_onOrder));
        emit InfoAddress(address(this));
    }
}    
    
    
