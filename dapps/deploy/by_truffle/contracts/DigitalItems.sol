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
    function Item_GetIdItem(address xCreater, string memory name) public pure returns(uint256 idItem) {
        idItem = uint256(keccak256(abi.encodePacked(xCreater, name)));
    }
    function Item_Add(uint256 idItem, uint32 amountItem) public {
        require(s_items[idItem].creater == msg.sender, "[ERR]Not creater.");
        _mint(msg.sender, idItem, amountItem, "");
    }
    function Item_Remove(uint256 idItem, uint32 amountItem) public {
        require(s_items[idItem].creater == msg.sender, "[ERR]Not creater.");
        _burn(msg.sender, idItem, amountItem);
    }
    function Item_GetBalance(address xOwner, uint256 idItem) public view returns(uint256 balance) {
        balance = balanceOf(xOwner, idItem);
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
    function Wei_GetBalance(address xOwner) public view returns(uint256 balance) {
        balance = s_balances[xOwner];
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
    modifier fromSender(uint256 idItem, uint32 amountItem) {
        uint256 amountItemBefore = balanceOf(msg.sender, idItem);
        require(amountItemBefore >= amountItem, "[ERR]Not enough Item.");
        _;
    }
    function AddOrderSell(uint256 idItem, uint32 price, uint32 amountItem) public fromSender(idItem, amountItem) {
        item_fromSenderToOnOrder(idItem, amountItem);
        s_items[idItem].prices[price].orderInfo[ORDER_KIND_SELL].orderList.push(Order(msg.sender, amountItem));
    }
    function AddOrderBuy(uint256 idItem, uint32 price, uint32 amountItem) public {
        uint256 amountWei = amountItem * price;
        amountWei += getFeeBase(amountWei);			// Fee payment by Buyer
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

    uint8 constant SELF_KIND_SELLER = 0;
    uint8 constant SELF_KIND_BUYER = 1;
    function TryMatchingOrders(uint256 idItem, uint32 price, uint8 orderKindSelf, uint32 indexOrderSelf, uint32 amountItemReqSelf) public {
        OrderInfo storage s_orderInfoSelf = s_items[idItem].prices[price].orderInfo[orderKindSelf];
        require(amountItemReqSelf <= s_orderInfoSelf.orderList[indexOrderSelf].amountItem, "[ERR]Not enough item amount.");
        (uint8 selfKind, uint8 orderKindPeer) = analyzeOrderKindInfo(orderKindSelf);
        OrderInfo storage s_orderInfoPeer = s_items[idItem].prices[price].orderInfo[orderKindPeer];
        uint32 listLenPeer = uint32(s_orderInfoPeer.orderList.length);
        uint32 amountItemRemain = amountItemReqSelf;
        require(s_orderInfoPeer.indexStart < listLenPeer, "[ERR]No order.");
        for(uint32 indexOrderPeer = s_orderInfoPeer.indexStart; indexOrderPeer < listLenPeer; indexOrderPeer += 1){
            uint32 amountItemPeer = s_orderInfoPeer.orderList[indexOrderPeer].amountItem;
            if(amountItemPeer != 0){
                amountItemRemain = matching(idItem, price, selfKind, s_orderInfoSelf, s_orderInfoPeer, indexOrderSelf, indexOrderPeer, amountItemPeer, amountItemRemain);
                if(amountItemRemain <= 0){
                    break;
                }
            }
        }
        updateIndexStart(idItem, price, orderKindSelf);
        updateIndexStart(idItem, price, orderKindPeer);
    }
    function matching(uint256 idItem, uint32 price, uint8 selfKind, OrderInfo storage s_orderInfoSelf, OrderInfo storage s_orderInfoPeer, uint32 indexOrderSelf, uint32 indexOrderPeer, uint32 amountItemPeer, uint32 amountItemRemain) private returns(uint32 amountItemRemainNew) {
        uint32 amountItemDone = 0;
        if(s_orderInfoSelf.orderList[indexOrderSelf].xOwner != s_orderInfoPeer.orderList[indexOrderPeer].xOwner){
            if(amountItemRemain <= amountItemPeer){
                amountItemDone = amountItemRemain;
                amountItemRemainNew = 0;
            }else{
                amountItemDone = amountItemPeer;
                amountItemRemainNew = amountItemRemain - amountItemDone;
            }
            s_orderInfoSelf.orderList[indexOrderSelf].amountItem -= amountItemDone;
            s_orderInfoPeer.orderList[indexOrderPeer].amountItem -= amountItemDone;
            if(amountItemDone > 0){
                trade(idItem, price, selfKind, amountItemDone, s_orderInfoSelf.orderList[indexOrderSelf].xOwner, s_orderInfoPeer.orderList[indexOrderPeer].xOwner);
            }
        }
    }
    function CancelOrder(uint256 idItem, uint32 price, uint8 orderKindSelf, uint32 indexOrderSelf) public {
        OrderInfo storage s_orderInfoSelf = s_items[idItem].prices[price].orderInfo[orderKindSelf];
        require(s_orderInfoSelf.orderList[indexOrderSelf].xOwner == msg.sender, "[ERR]Not owner.");
        uint32 amountItem = s_orderInfoSelf.orderList[indexOrderSelf].amountItem;
        s_orderInfoSelf.orderList[indexOrderSelf].amountItem = 0;
        updateIndexStart(idItem, price, orderKindSelf);
        (uint8 selfKind,) = analyzeOrderKindInfo(orderKindSelf);
        if(selfKind == SELF_KIND_SELLER){
            // Item : xOnOrder > msg.sender
            item_fromOnOrderToSender(idItem, amountItem);
        }else{
            // Wei : xOnOrder > msg.sender
            uint256 amountWei = amountItem * price;
            amountWei += getFeeBase(amountWei);
            wei_fromOnOrderToSender(amountWei);
        }
        emit infoCancel(idItem, price, orderKindSelf, indexOrderSelf, amountItem);
    }
    event infoCancel(uint256 idItem, uint32 price, uint8 orderKindSelf, uint32 indexOrderSelf, uint32 amountItem);
    function analyzeOrderKindInfo(uint8 orderKindSelf) private pure returns(uint8 selfKind, uint8 orderKindPeer) {
        if(orderKindSelf == ORDER_KIND_SELL){
            selfKind = SELF_KIND_SELLER;
            orderKindPeer = ORDER_KIND_BUY;
        }else if(orderKindSelf == ORDER_KIND_BUY){
            selfKind = SELF_KIND_BUYER;
            orderKindPeer = ORDER_KIND_SELL;
        }else {
            require((orderKindSelf == ORDER_KIND_SELL)||(orderKindSelf == ORDER_KIND_BUY), "[ERR]Invalid order kind.");
        }
    }
    function updateIndexStart(uint256 idItem, uint32 price, uint8 orderKind) private {
        OrderInfo storage s_orderInfo = s_items[idItem].prices[price].orderInfo[orderKind];
        uint32 listLen = uint32(s_orderInfo.orderList.length);
        uint32 indexOrder;
        for(indexOrder = s_orderInfo.indexStart; indexOrder < listLen; indexOrder += 1){
            if(s_orderInfo.orderList[indexOrder].amountItem != 0){
                break;
            }
        }
        if(indexOrder > s_orderInfo.indexStart){
            s_orderInfo.indexStart = indexOrder;
        }
    }
    
    function trade(uint256 idItem, uint32 price, uint8 selfKind, uint32 amountItemDone, address xSelf, address xPeer) private {
        uint256 feeForWorker;
        if(selfKind == SELF_KIND_SELLER){
           feeForWorker = wei_item_trade(idItem, price, amountItemDone, xSelf, xPeer);
        }else{
           feeForWorker = wei_item_trade(idItem, price, amountItemDone, xPeer, xSelf);
        }
        emit infoMatching(idItem, price, amountItemDone, xSelf, xPeer, feeForWorker);
    }
    event infoMatching(uint256 idItem, uint32 price, uint32 amountItemDone, address xSelf, address xPeer, uint256 feeForWorker);
    uint256 constant FEE_RATE = 1;					// Fee rate : 1%
    function getFeeBase(uint256 amountWei) private pure returns(uint256 feeBase) {
        feeBase = (amountWei / 100) * FEE_RATE;
    }
    function wei_item_trade(uint256 idItem, uint32 price, uint32 amountItem, address xSeller, address xBuyer) private returns (uint256 feeForWorker){
        // Item : xOnOrder > xBuyer
        s_onOrder.Item_SendTo(xBuyer, idItem, amountItem);
        // Wei : xOnOrder > xSeller, xAgree
        uint256 amountWei = amountItem * price;
        uint256 feeBase = getFeeBase(amountWei);
        s_balances[address(s_onOrder)] -= amountWei + feeBase;	// Fee payment by Buyer
        s_balances[xSeller] += amountWei - feeBase;			// Fee payment by Seller
        feeForWorker = feeBase + feeBase;
        s_balances[msg.sender] += feeForWorker;			// Fee receipt for a matching worker
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
        setApprovalForAll(address(s_onOrder), true);
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
    
    
