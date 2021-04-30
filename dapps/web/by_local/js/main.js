var ZTIMES = ZTIMES || {};
ZTIMES.UTL = {
  init: function(){
    console.log("ZTIMES.UTL.init()");
  },
  test: function(){
    console.log("ZTIMES.UTL.test()");
  },
  GetRandom: function(rangeMax){
    return Math.floor( Math.random() * rangeMax );
  },
  ToStr: function(num){
    return num.toString(10);
  },
  FillZero2: function(num){
    return ("0"+num).slice(-2);
  },
  GetTimeStamp: function(){
    const date = new Date();
    const year = date.getFullYear();
    const month = this.FillZero2(date.getMonth()+1);
    const day = this.FillZero2(date.getDate());
    const hour = this.FillZero2(date.getHours());
    const minute = this.FillZero2(date.getMinutes());
    const second = this.FillZero2(date.getSeconds());
    return (year+"/"+month+"/"+day+" "+hour+":"+minute+":"+second);
  },
};
ZTIMES.ACCOUNTS = {
  init: function(){
    console.log("ZTIMES.ACCOUNTS.init()");
    this.UNIT = new ZTIMES.ACCOUNTS.UNIT();
    this.SELF = new ZTIMES.ACCOUNTS.DB("#SELF",false);
    this.PEER = new ZTIMES.ACCOUNTS.DB("#PEER",true);
  },
  test: function(){
    console.log("ZTIMES.ACCOUNTS.test()");
  },
  UNIT: function(){},
  DB: function(keyStorage,isBlank){
    this.keyStorage = keyStorage;
    this.xSelected = "";
    this.accounts = {};
    this.onLoad(isBlank);
  },
};
ZTIMES.ACCOUNTS.UNIT.prototype = {
  selected: "Wei",
  Change: function(unitOld){
    let unitNew = "Wei";
    if(unitOld === "Wei"){
      unitNew = "Ether";
    }
    else if(unitOld === "Ether"){
      unitNew = "Wei";
    }
    this.selected = unitNew;
    return unitNew;
  },
  Get: function(){
    return this.selected;
  },
  GetAmountText: function(amount,unit){
    const amountText = amount + ' ' + unit;
    return amountText;
  },
  GetAmount: function(amountText){
    const textList = amountText.split(' ');
    const amount = textList[0];
    const unit = textList[1];
    return Number(amount);
  },
};
ZTIMES.ACCOUNTS.DB.prototype = {
  onLoad: function(isBlank){
    if(typeof(Storage) === "undefined"){
      console.log("Not supported.");
      return;
    }
    this.accounts = this.storageReadAll();
    if(isBlank === true){
      this.addInit();
      this.xSelected = "";
    }
    else{
      this.xSelected = this.getFirst();
    }
  },
  addInit: function(){
    const xAddress = "";
    const name = "";
    this.accounts[xAddress] = {"name":name};
  },
  storageReadAll: function(){
    const accounts = JSON.parse(localStorage.getItem(this.keyStorage));
    if(accounts === null){
      return {};
    }
    return accounts;
  },
  storageWrite: function(xAddress,name){
    const accounts = JSON.parse(localStorage.getItem(this.keyStorage));
    if(accounts === null){
      const accountsNew = {};
      accountsNew[xAddress] = {"name":name};
      localStorage.setItem(this.keyStorage,JSON.stringify(accountsNew));
    }
    else{
      accounts[xAddress] = {"name":name};
      localStorage.setItem(this.keyStorage,JSON.stringify(accounts));
    }
  },
  Set: function(xAddress,name){
    if(this.isValidAddress(xAddress) === false){
      return;
    }
    if(this.isValidName(name) === false){
      return;
    }
    this.accounts[xAddress] = {"name":name};
    this.xSelected = xAddress;
    this.storageWrite(xAddress,name);
  },
  isValidAddress: function(xAddress){
    if(xAddress === ""){
      alert("Invalid address.");
      return false;
    }
    const result = ZTIMES.BLOCKCHAIN.IsAddress(xAddress);
    if(result === null){
      alert("Invalid address.");
      return false;
    }
    return true;
  },
  isValidName: function(name){
    if(name === ""){
      return true;
    }
    const result = name.match(/^[\w\d\s]{1,32}$/gm);
    if(result === null){
      alert("Invalid name.");
      return false;
    }
    return true;
  },
  GetSelected: function(){
    const xAddress = this.xSelected;
    if(xAddress === ""){
      return {"xAddress":"","name":""};
    }
    else{
      const name = this.accounts[xAddress].name;
      return {"xAddress":xAddress,"name":name};
    }
  },
  GetPrevious: function(){
    let xAddressPrevious = "#NONE";
    for(let xAddress in this.accounts){
      if(xAddress === this.xSelected){
        break;
      }
      xAddressPrevious = xAddress;
    }
    if(xAddressPrevious === "#NONE"){
      xAddressPrevious = this.getLast();
    }
    this.xSelected = xAddressPrevious;
    return this.GetSelected();
  },
  GetNext: function(){
    let isSelected = false;
    let xAddressNext = "#NONE";
    for(let xAddress in this.accounts){
      if(isSelected == true){
        xAddressNext = xAddress;
        break;
      }
      if(xAddress === this.xSelected){
        isSelected = true;
      }
    }
    if(xAddressNext === "#NONE"){
      xAddressNext = this.getFirst();
    }
    this.xSelected = xAddressNext;
    return this.GetSelected();
  },
  getFirst: function(){
    let xAddressFirst = "";
    for(let xAddress in this.accounts){
      xAddressFirst = xAddress;
      break;
    }
    return xAddressFirst;
  },
  getLast: function(){
    let xAddressLast = "";
    for(let xAddress in this.accounts){
      xAddressLast = xAddress;
    }
    return xAddressLast;
  },
  GetName: function(xAddress){
    return this.accounts[xAddress].name;
  },
  GetNameToAddress: function(name){
    let xAddressRet = "";
    for(let xAddress in this.accounts){
      if(name === this.accounts[xAddress].name){
        xAddressRet = xAddress;
        break;
      }
    }
    return xAddressRet;
  },
};

ZTIMES.BLOCKCHAIN = {
  web3Js: null,
  xAddressContract: null,
  instance: null,
  init: async function(){
    console.log("ZTIMES.BLOCKCHAIN.init()");
//    if((typeof window.ethereum !== 'undefined')||(typeof window.web3 !== 'undefined')){
      // const provider = window['ethereum'] || window.web3.currentProvider;
      // this.web3Js = new Web3(provider);
      // ethereum.autoRefreshOnNetworkChange = false;
      // const accounts = await ethereum.enable()
      // console.log(accounts);
      // console.log("isMetaMask : " + ethereum.isMetaMask);
      // console.log("networkVersion : " + ethereum.networkVersion);
      // console.log("selectedAddress : " + ethereum.selectedAddress);
//      console.log("MetaMask is not supported.");
//    }
//    else{
      console.log('<Ganache : web3>');
//      const accessUrl = 'http://127.0.0.1:7545';
//      const provider = new Web3.providers.HttpProvider(accessUrl);
      const accessUrl = 'ws://127.0.0.1:7545';
      const provider = new Web3.providers.WebsocketProvider(accessUrl);
      this.web3Js = new Web3(provider);
      this.initContract();
//    }
  },
  test: function(){
    console.log("ZTIMES.BLOCKCHAIN.test()");
  },
  initContract: function(){
    const contractJson = this.getContractJson();
    const contractABI = contractJson["abi"];
    // const networkId = ethereum.networkVersion;
    const networkId = 5777;
    this.xAddressContract = contractJson["networks"][networkId].address;
    this.instance = new this.web3Js.eth.Contract(contractABI,this.xAddressContract);
    return this.instance;
  },
  getContractJson: function(){
    // @note: abiJson_xxxx.js is required.
    return AbiJson;
  },
  ContractCall: async function(strMethod,...params){
    let result = "";
    const method = this.getMethod(strMethod);
    const payload = this.getPayload(params);
    const applyMethod = method.apply(this,params);
    const applyCall = applyMethod.call.apply(this,payload);
    await applyCall.then(function(ret){
      result = ret;
    });
    return result;
  },
  ContractSend: async function(strMethod,...params){
    const method = this.getMethod(strMethod);
    const payload = this.getPayload(params);
    const applyMethod = method.apply(this,params);
    if(payload === undefined){
      await applyMethod.send().on("error",function(error){
        console.log(error);
      });
    }
    else{
      await applyMethod.send(payload).on("error",function(error){
        console.log(error);
      });
    }
  },
  getMethod: function(strMethod){
    const method = this.instance.methods[strMethod];
    return method;
  },
  getPayload: function(params){
    const paramsLast = params.slice(-1)[0];
    const type = Object.prototype.toString.call(paramsLast);
    if(type === "[object Object]"){   // pairs
      const payload = params.pop();
      return payload;
    }
    else{
      return undefined;
    }
  },
  ReadyWallet: function(password){
    const wallet = this.web3Js.eth.accounts.wallet.load(password);
    if(wallet.length === 0){
      const entropy = this.getEntropy();
      this.web3Js.eth.accounts.wallet.create(2,entropy);
      const walletLen = this.web3Js.eth.accounts.wallet.length;
      for(let cnt=0;cnt<walletLen;cnt+=1){
        const accountWallet = this.web3Js.eth.accounts.wallet[cnt];
        console.log(accountWallet);
        let name = "";
        if(cnt === 0){
          name = "PlayerP";
        }
        else if(cnt === 1){
          name = "PlayerQ";
        }
        ZTIMES.ACCOUNTS.SELF.Set(accountWallet.address,name);
      }
      this.web3Js.eth.accounts.wallet.save(password);
    }
    else{
      const walletLen = wallet.length;
      for(let cnt=0;cnt<walletLen;cnt+=1){
        const accountWallet = wallet[cnt];
        console.log(accountWallet);
        const name = ZTIMES.ACCOUNTS.SELF.GetName(accountWallet.address);
        ZTIMES.ACCOUNTS.SELF.Set(accountWallet.address,name);
      }
    }
  },
  getEntropy: function(){
    // const entropy = '54674321§3456764321§345674321§3453647544±±±§±±±!!!43534534534534';
    const message = Math.random().toString();
    const entropy = this.web3Js.eth.accounts.hashMessage(message);
    return entropy;
  },
  ImportAcount: function(password,privateKey,address,name){
    this.web3Js.eth.accounts.wallet.add({
      privateKey: privateKey,
      address: address
    });
    ZTIMES.ACCOUNTS.SELF.Set(address,name);
    this.web3Js.eth.accounts.wallet.save(password);
  },
  GetBalance: async function (xAddress) {
    const balance = await this.web3Js.eth.getBalance(xAddress);
    return balance;
  },
  SendWei: async function(xSelf,xPeer,amount,gas){
    await this.web3Js.eth.sendTransaction({from:xSelf,to:xPeer,value:amount,gas:gas});
  },
  GetAmount: function(amountOld,unitNew){
    if(unitNew === "Wei"){
      return this.web3Js.utils.toWei(amountOld.toString(),'ether');
    }
    else if(unitNew === "Ether"){
      return this.web3Js.utils.fromWei(amountOld.toString(),'ether');
    }
    else{
      console.log("[ERR]GetAmount() unitNew:" + unitNew);
    }
  },
  IsAddress: function(xAddress){
    return this.web3Js.utils.isAddress(xAddress);
  },
};

ZTIMES.GUI = {
  init: function(){
    console.log("ZTIMES.GUI.init()");
    this.WALLET = new ZTIMES.GUI.WALLET();
    this.BALANCE = new ZTIMES.GUI.BALANCE();
    this.CONTRACT = new ZTIMES.GUI.CONTRACT();
  },
  test: function(){
    console.log("ZTIMES.GUI.test()");
  },
  setup: function(){
  },
  keyDown: function(){
    return (this.isTouch ? 'touchstart':'mousedown');
  },
  keyMove: function(){
    return (this.isTouch ? 'touchmove':'mousemove');
  },
  keyUp: function(){
    return (this.isTouch ? 'touchend':'mouseup');
  },
  addKeyUp: function(id,action){
    try{
      document.getElementById(id).addEventListener(this.keyUp(),action,false);
    }
    catch(e){ console.log(e); }
    finally{}
  },
  addChange: function(id,action){
    try{
      document.getElementById(id).addEventListener('change',action,false);
    }
    catch(e){ console.log(e); }
    finally{}
  },
  editInnerText: function(id,text){
    try{
      document.getElementById(id).innerText = text;
    }
    catch(e){ console.log(e); }
    finally{}
  },
  editValueText: function(id,text){
    try{
      document.getElementById(id).value = text;
    }
    catch(e){ console.log(e); }
    finally{}
  },
  refValueText: function(id){
    try{
      return document.getElementById(id).value;
    }
    catch(e){ console.log(e); }
    finally{}
  },
  showDiv: function(id){
    try{
      const el = document.getElementById(id);
      el.style.display = "block";
    }
    catch(e){ console.log(e); }
    finally{}
  },
  hideDiv: function(id){
    try{
      const el = document.getElementById(id);
      el.style.display = "none";
    }
    catch(e){ console.log(e); }
    finally{}
  },
  WALLET: function(){
    this.init();
  },
  BALANCE: function(){
    this.init();
  },
  CONTRACT: function(){
    this.init();
  },
};
ZTIMES.GUI.WALLET.prototype = {
  init: function(){
    ZTIMES.GUI.addKeyUp('iWalletReady',async function(){
      ZTIMES.GUI.editInnerText('iWalletInfo',"Processing...");
      setTimeout(ZTIMES.GUI.WALLET.timeoutWalletReady,100);
    },false);
    ZTIMES.GUI.addKeyUp('iImportAction',async function(){
      ZTIMES.GUI.editInnerText('iWalletInfo',"Processing...");
      setTimeout(ZTIMES.GUI.WALLET.timeoutImport,100);
    },false);
  },
  timeoutWalletReady: async function(){
    const password = ZTIMES.GUI.refValueText('iWalletPassword');
    const xPlayers = await ZTIMES.BLOCKCHAIN.ReadyWallet(password);
    ZTIMES.GUI.editInnerText('iWalletInfo',"Ready OK.");
    const xPlayerP = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerP");
    const xPlayerQ = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerQ");
    ZTIMES.GUI.editInnerText('iAddressP',xPlayerP);
    ZTIMES.GUI.editInnerText('iAddressQ',xPlayerQ);
    const xGanache0 = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("Ganache0");
    ZTIMES.GUI.editInnerText('iAddressG',xGanache0);
    ZTIMES.GUI.WALLET.dispBalance('iAmountP',xPlayerP);
    ZTIMES.GUI.WALLET.dispBalance('iAmountQ',xPlayerQ);
    ZTIMES.GUI.CONTRACT.ready();
  },
  timeoutImport: async function(){
    const privateKey = ZTIMES.GUI.refValueText('iImportPrivateKey');
    const address = ZTIMES.GUI.refValueText('iImportAddress');
    const password = ZTIMES.GUI.refValueText('iWalletPassword');
    const name = "Ganache0";
    await ZTIMES.BLOCKCHAIN.ImportAcount(password,privateKey,address,name);
    ZTIMES.GUI.editValueText('iImportPrivateKey',"");
    ZTIMES.GUI.editValueText('iImportAddress',"");
    ZTIMES.GUI.editInnerText('iWalletInfo',"Done.");
    const xGanache0 = ZTIMES.ACCOUNTS.SELF.GetNameToAddress(name);
    ZTIMES.GUI.editInnerText('iAddressG',xGanache0);
  },
  dispBalance: async function(id,xAddress){
    const balance = await ZTIMES.BLOCKCHAIN.GetBalance(xAddress);
    const unit = "Wei";
    const amountText = ZTIMES.ACCOUNTS.UNIT.GetAmountText(balance,unit);
    ZTIMES.GUI.editValueText(id,amountText);
    console.log(amountText);
  },
  onLoad: function(){
  },
};
ZTIMES.GUI.BALANCE.prototype = {
  init: function(){
    ZTIMES.GUI.addKeyUp('iSendToWallet',async function(){
      ZTIMES.GUI.editInnerText('iSendInfo',"Processing...");
      setTimeout(ZTIMES.GUI.BALANCE.timeoutSendToWallet,100);
    },false);
  },
  onLoad: function(){
  },
  timeoutSendToWallet: function(){
    ZTIMES.GUI.BALANCE.sendWei();
  },
  sendWei: async function(){
    const xSelf = ZTIMES.GUI.refValueText('iAddressG');
    if(xSelf === ""){
      alert("Invalid imported address.");
      return;
    }
    const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
    if(xPlayerP === ""){
      alert("Invalid addressP.");
      return;
    }
    const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
    if(xPlayerQ === ""){
      alert("Invalid addressQ.");
      return;
    }
    const amountText = ZTIMES.GUI.refValueText('iAmountG');
    const amount = ZTIMES.ACCOUNTS.UNIT.GetAmount(amountText);
    if(amount === 0){
      alert("Invalid imported amount.");
      return;
    }
    const unit = "Wei";
    const gas = '5000000';
    await ZTIMES.BLOCKCHAIN.SendWei(xSelf,xPlayerP,amount,gas);
    await ZTIMES.BLOCKCHAIN.SendWei(xSelf,xPlayerQ,amount,gas);
    ZTIMES.GUI.editInnerText('iSendInfo',"Sent to PlayerP and PlayerQ.");
    ZTIMES.GUI.WALLET.dispBalance('iAmountP',xPlayerP);
    ZTIMES.GUI.WALLET.dispBalance('iAmountQ',xPlayerQ);
  },
};
ZTIMES.GUI.CONTRACT.prototype = {
  zPlayer: "PlayerP",
  xPlayer: 0,
  idItem: 0,
  ORDER_KIND_SELL: 0,
  ORDER_KIND_BUY: 1,
  ready: async function(){
    const xCreator = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerP");
    this.idItem = await ZTIMES.CONTRACT_BODY.Item_GetIdItem(xCreator,"ItemA");
    this.refreshOrderList();
  },
  init: function(){
    ZTIMES.GUI.addKeyUp('iZPlayerP',async function(){
      ZTIMES.GUI.CONTRACT.setPlayer("PlayerP");
      ZTIMES.GUI.editInnerText('iContractInfo',"Activate PlayerP.");
    },false);
    ZTIMES.GUI.addKeyUp('iZPlayerQ',async function(){
      ZTIMES.GUI.CONTRACT.setPlayer("PlayerQ");
      ZTIMES.GUI.editInnerText('iContractInfo',"Activate PlayerQ.");
    },false);
    ZTIMES.GUI.addKeyUp('iDepositWei',async function(){
      ZTIMES.GUI.CONTRACT.depositWei(3000 * 1000000000);	// 3000 Gwei
      ZTIMES.GUI.editInnerText('iContractInfo',"Deposit Wei.");
    },false);
    ZTIMES.GUI.addKeyUp('iWithdrawWei',async function(){
      ZTIMES.GUI.CONTRACT.withdrawWei();
      ZTIMES.GUI.editInnerText('iContractInfo',"Withdraw Wei.");
    },false);
    ZTIMES.GUI.addKeyUp('iCreateItemA',async function(){
      if(ZTIMES.GUI.CONTRACT.zPlayer !== "PlayerP"){
        alert("Not PlayerP.");
        return;
      }
      ZTIMES.GUI.CONTRACT.createItemA(2000,"ItemA");
      ZTIMES.GUI.editInnerText('iContractInfo',"Create ItemA.");
    },false);
    ZTIMES.GUI.addKeyUp('iSellOrder',async function(){
      ZTIMES.GUI.CONTRACT.addSellOrderItemA(900,10);
      ZTIMES.GUI.editInnerText('iContractInfo',"Request a sell order.");
    },false);
    ZTIMES.GUI.addKeyUp('iBuyOrder',async function(){
      ZTIMES.GUI.CONTRACT.addBuyOrderItemA(900,6);
      ZTIMES.GUI.editInnerText('iContractInfo',"Request a buy order.");
    },false);
    ZTIMES.GUI.addKeyUp('iSell0',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_SELL,0);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iSell1',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_SELL,1);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iSell2',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_SELL,2);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iSell3',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_SELL,3);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iBuy0',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_BUY,0);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iBuy1',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_BUY,1);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iBuy2',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_BUY,2);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
    ZTIMES.GUI.addKeyUp('iBuy3',async function(){
      ZTIMES.GUI.CONTRACT.tryAgreeOrderItemA(900,ZTIMES.GUI.CONTRACT.ORDER_KIND_BUY,3);
      ZTIMES.GUI.editInnerText('iContractInfo',"Tried to agree orders.");
    },false);
  },
  setPlayer: async function(zPlayer){
    this.zPlayer = zPlayer;
    this.xPlayer = ZTIMES.ACCOUNTS.SELF.GetNameToAddress(this.zPlayer);
    ZTIMES.GUI.editInnerText('iZAddress',this.xPlayer);
    this.refreshBalanceWei();
    this.refreshBalanceItemA();
  },
  depositWei: async function(wei){
    await ZTIMES.CONTRACT_BODY.Wei_Deposit(this.xPlayer,wei);
    this.refreshBalanceWei();
  },
  withdrawWei: async function(){
    await ZTIMES.CONTRACT_BODY.Wei_Withdraw(this.xPlayer);
    this.refreshBalanceWei();
  },
  refreshBalanceWei: async function(){
    const balance = await ZTIMES.CONTRACT_BODY.Wei_GetBalance(this.xPlayer);
    ZTIMES.GUI.editInnerText('iZAmountWei',balance);
    const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
    if(xPlayerP === this.xPlayer){
      ZTIMES.GUI.WALLET.dispBalance('iAmountP',this.xPlayer);
    }
    else{
      const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
      if(xPlayerQ === this.xPlayer){
        ZTIMES.GUI.WALLET.dispBalance('iAmountQ',this.xPlayer);
      }
    }
  },
  createItemA: async function(amountItem,name){
    this.idItem = await ZTIMES.CONTRACT_BODY.Item_Create(this.xPlayer,amountItem,name);
    this.refreshBalanceItemA();
  },
  refreshBalanceItemA: async function(){
    const balance = await ZTIMES.CONTRACT_BODY.Item_GetBalance(this.xPlayer,this.idItem);
    ZTIMES.GUI.editInnerText('iZAmountItemA',balance);
  },
  addSellOrderItemA: async function(price,amountItem){
    await ZTIMES.CONTRACT_BODY.AddOrderSell(this.xPlayer,this.idItem,price,amountItem);
    this.refreshOrderList();
  },
  addBuyOrderItemA: async function(price,amountItem){
    await ZTIMES.CONTRACT_BODY.AddOrderBuy(this.xPlayer,this.idItem,price,amountItem);
    this.refreshOrderList();
  },
  tryAgreeOrderItemA: async function(price,orderKindSelf,indexShow){
    if(this.xPlayer === 0){
      alert("Select a player.");
      return;
    }
    const retOrderList = await ZTIMES.CONTRACT_BODY.GetOrderInfo(this.idItem,price,orderKindSelf);
    const indexStart = Number(retOrderList.indexStart);
    const listLen = Number(retOrderList.listLen);
    const indexOrderSelf = indexStart+indexShow;
    const retOrder = await ZTIMES.CONTRACT_BODY.GetOrder(this.idItem,price,orderKindSelf,indexOrderSelf);
    const amountItemReqSelf = Number(retOrder.amountItem);
    await ZTIMES.CONTRACT_BODY.TryAgreeOrders(this.xPlayer,this.idItem,price,orderKindSelf,indexOrderSelf,amountItemReqSelf);
    this.refreshOrderList();
  },
  refreshOrderList: async function(){
    this.showOrderList(900,this.ORDER_KIND_SELL);
    this.showOrderList(900,this.ORDER_KIND_BUY);
  },
  showOrderList: async function(price,orderKind){
    const retOrderList = await ZTIMES.CONTRACT_BODY.GetOrderInfo(this.idItem,price,orderKind);
    const indexStart = Number(retOrderList.indexStart);
    const listLen = Number(retOrderList.listLen);
    let indexOrder= Number(indexStart);
    for(let indexShow=Number(0); indexShow<Number(4); indexShow+=Number(1)){
      if(indexOrder<listLen){
        this.showOrder(price,orderKind,indexOrder,indexShow);
      }
      else{
        this.showOrderBlank(price,orderKind,indexOrder,indexShow);
      }
      indexOrder+=Number(1);
    }
  },
  showOrder: async function(price,orderKind,indexOrder,indexShow){
    const retOrder = await ZTIMES.CONTRACT_BODY.GetOrder(this.idItem,price,orderKind,indexOrder);
    const xOwner = retOrder.xOwner;
    const amountItem = Number(retOrder.amountItem);
    const zPlayer = this.fromAddressToName(xOwner);
    const domId = this.getOrderDomId(orderKind,indexShow);
    const text = this.getOrderText(zPlayer,amountItem);
    ZTIMES.GUI.editInnerText(domId,text);
  },
  showOrderBlank: async function(price,orderKind,indexOrder,indexShow){
    const domId = this.getOrderDomId(orderKind,indexShow);
    ZTIMES.GUI.editInnerText(domId,"");
  },
  fromAddressToName: function(xPlayer){
    const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
    if(xPlayer === xPlayerP){
      return "PlayerP";
    }
    const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
    if(xPlayer === xPlayerQ){
      return "PlayerQ";
    }
  },
  getOrderText: function(zPlayer,amountItem){
    const text = "[" + amountItem + " ItemA by " + zPlayer + "]";
    return text;
  },
  getOrderDomId: function(orderKind,indexShow){
    if(orderKind === this.ORDER_KIND_SELL){
      return "iSellList" + indexShow;
    }
    if(orderKind === this.ORDER_KIND_BUY){
      return "iBuyList" + indexShow;
    }
  },
};

ZTIMES.CONTRACT_LIB = {
  passPhrase: "secret passPhrase",
  Encrypt: function(rawText){
    const encryptedText = CryptoJS.AES.encrypt(rawText,this.passPhrase).toString();
    return encryptedText;
  },
  Decrypt: function(encryptedText){
    const rawText = CryptoJS.AES.decrypt(encryptedText,this.passPhrase).toString(CryptoJS.enc.Utf8);
    return rawText;
  },
};

ZTIMES.CONTRACT_BODY = {
  gas: 4712388,
  gasPrice: 100000000000,	//= 1000 gwei = 1 szabo
  init: function(){
    console.log("ZTIMES.CONTRACT_BODY.init()");
  },
  test: async function(){
    console.log("ZTIMES.CONTRACT_BODY.test()");
  },
  Wei_Deposit: async function(xAddressSelf,wei){
    await ZTIMES.BLOCKCHAIN.ContractSend('Wei_Deposit',{from:xAddressSelf,value:wei,gas:this.gas,gasPrice:this.gasPrice});
  },
  Wei_Withdraw: async function(xAddressSelf){
    await ZTIMES.BLOCKCHAIN.ContractSend('Wei_Withdraw',{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice});
  },
  Wei_GetBalance: async function(xOwner){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Wei_GetBalance',xOwner);
    return balance;
  },
  Item_Create: async function(xAddressSelf,amountItem,name){
    await ZTIMES.BLOCKCHAIN.ContractSend('Item_Create',amountItem,name,{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice});
    const xCreater = xAddressSelf;
    const idItem = this.Item_GetIdItem(xCreater,name);
    return idItem;
  },
  Item_GetIdItem: async function(xCreater,name){
    const idItem = await ZTIMES.BLOCKCHAIN.ContractCall('Item_GetIdItem',xCreater,name);
    return idItem;
  },
  Item_GetBalance: async function(xOwner,idItem){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Item_GetBalance',xOwner,idItem);
    return balance;
  },
  AddOrderSell: async function(xAddressSelf,idItem,price,amountItem){
    await ZTIMES.BLOCKCHAIN.ContractSend('AddOrderSell',idItem,price,amountItem,{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice});
  },
  AddOrderBuy: async function(xAddressSelf,idItem,price,amountItem){
    await ZTIMES.BLOCKCHAIN.ContractSend('AddOrderBuy',idItem,price,amountItem,{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice});
  },
  GetOrderInfo: async function(idItem,price,orderKind){
    const result = await ZTIMES.BLOCKCHAIN.ContractCall('GetOrderInfo',idItem,price,orderKind);
    return result;	// indexStart,listLen
  },
  GetOrder: async function(idItem,price,orderKind,indexOrder){
    const result = await ZTIMES.BLOCKCHAIN.ContractCall('GetOrder',idItem,price,orderKind,indexOrder);
    return result;	// xOwner,amountItem
  },
  TryAgreeOrders: async function(xAddressSelf,idItem,price,orderKindSelf,indexOrderSelf,amountItemReqSelf){
    await ZTIMES.BLOCKCHAIN.ContractSend('TryAgreeOrders',idItem,price,orderKindSelf,indexOrderSelf,amountItemReqSelf,{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice});
  },
}

ZTIMES.RUN = {
  init: function(){
    ZTIMES.ACCOUNTS.init();
    ZTIMES.BLOCKCHAIN.init();
    ZTIMES.GUI.init();
    ZTIMES.CONTRACT_BODY.init();
    ZTIMES.GUI.editInnerText('iWalletInfo',"Not ready.");
  },
  test: async function(){
    ZTIMES.ACCOUNTS.test();
    ZTIMES.BLOCKCHAIN.test();
    ZTIMES.GUI.test();
    ZTIMES.CONTRACT_BODY.test();
  },
};
window.addEventListener('load',async function(){
  ZTIMES.RUN.init();
  ZTIMES.RUN.test();
});

// ethereum.on('accountsChanged',function(accounts){
//   console.log("changed : " + accounts);
// });
