/*@CONTRACT: DigitalItems */
DigitalItems.address
DigitalItems.deployed().then(ret=>instance=ret)
web3.eth.getAccounts().then(ret=>accounts=ret)

instance.ShowInfo().then(ret=>result=ret)
result.logs
xOnOrder = result.logs[0].args.target
xDigitalItems = result.logs[1].args.target

instance.Item_Create(2000,"ItemA",{from:accounts[1]}).then(ret=>result=ret)
idItem = result.logs[0].args.id
idItem2 = instance.Item_GetIdItem("ItemA",{from:accounts[1]}).then(ret=>result=ret)
idItem2 == idItem	// false : Why?

instance.Wei_Deposit({from:accounts[1],value:100000}).then(ret=>result=ret)
instance.Wei_Deposit({from:accounts[2],value:100000}).then(ret=>result=ret)
instance.Wei_Withdraw({from:accounts[1]}).then(ret=>result=ret)

instance.AddOrderSell(idItem,900,10,{from:accounts[1]}).then(ret=>result=ret)
instance.AddOrderSell(idItem,900,10,{from:accounts[1]}).then(ret=>result=ret)
instance.AddOrderBuy(idItem,900,10,{from:accounts[2]}).then(ret=>result=ret)
instance.AddOrderBuy(idItem,900,5,{from:accounts[2]}).then(ret=>result=ret)
instance.AddOrderBuy(idItem,900,5,{from:accounts[2]}).then(ret=>result=ret)

SELL = 0
BUY = 1
instance.CancelOrder(idItem,900,BUY,0,{from:accounts[2]}).then(ret=>result=ret)
instance.CancelOrder(idItem,900,BUY,2,{from:accounts[2]}).then(ret=>result=ret)

instance.GetOrderInfo(idItem,900,SELL).then(ret=>result=ret)
instance.GetOrderInfo(idItem,900,BUY).then(ret=>result=ret)
instance.GetOrder(idItem,900,SELL,0).then(ret=>result=ret)
instance.GetOrder(idItem,900,SELL,1).then(ret=>result=ret)
instance.GetOrder(idItem,900,BUY,0).then(ret=>result=ret)
instance.GetOrder(idItem,900,BUY,1).then(ret=>result=ret)
instance.GetOrder(idItem,900,BUY,2).then(ret=>result=ret)

instance.TryMatchingOrders(idItem,900,SELL,0,10,{from:accounts[3]}).then(ret=>result=ret)
instance.TryMatchingOrders(idItem,900,BUY,1,5,{from:accounts[3]}).then(ret=>result=ret)
result.logs

(await instance.Wei_GetBalance(xOnOrder)).toNumber()
(await instance.Wei_GetBalance(accounts[1])).toNumber()
(await instance.Wei_GetBalance(accounts[2])).toNumber()
(await instance.Wei_GetBalance(accounts[3])).toNumber()
(await instance.Item_GetBalance(xOnOrder,idItem)).toNumber()
(await instance.Item_GetBalance(accounts[1],idItem)).toNumber()
(await instance.Item_GetBalance(accounts[2],idItem)).toNumber()

