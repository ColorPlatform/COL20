require("../util/util.js")

contract("ColorCoin-TestTransferFrom", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]
  var user3 = accounts[4]

  var owner = user1; var spender = user2; var dst = user3;

  contract("Test basic transfer", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides user1 with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })

    it("The owner allowes the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.approve(spender, _50, {from: owner})
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })

    it("The spender transfers coins from owner", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transferFrom(owner, dst, _30, {from: spender})
      // Check new balances
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _70, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _30, "Wrong dst balance")
      // check allowance
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _20, "Wrong allowance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })
  })

  contract("Test overdraft", () => {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides user1 with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("The owner allowes the spender to transfer 10 coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.approve(spender, _10, {from: owner})
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _10, "Wrong allowance")
    })

    it("The spender fails to transfer 30 coins from the owner", async () => {
      let instance = await ColorCoin.deployed()
      let hadException = false;
      try {
        await instance.transferFrom(owner, dst, _30, {from: spender})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")
      // Check that balances have not changed
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _100, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _0, "Wrong dst balance")
      // check that allowance has not changed
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _10, "Wrong allowance")
    })
  })

  contract("Test transferFrom without approval", () => {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides the owher with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("The owner doesn't approve the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _0, "Wrong allowance")
    })

    it("The spender fails to transfer coins from the owner without approval", async () => {
      let instance = await ColorCoin.deployed()
      let hadException = false;
      try {
        await instance.transferFrom(owner, dst, _30, {from: spender})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")
      // Check that balances have not changed
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _100, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _0, "Wrong dst balance")
      // check that allowance has not changed
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _0, "Wrong allowance")
    })
  })
})
