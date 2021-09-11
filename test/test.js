const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('posts', async () => {
    let result, postCount
    const hash = 'QmV8cfu6n4NT5xRr2AHdKxFMTZEJrA44qgrBCr739BN9Wb'

    before(async () => {
      result = await decentragram.uploadPost('Post tweet', { from: author })
      postCount = await decentragram.postCount()
    })

    //check event
    it('creates posts', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      //assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.tweet, 'Post tweet', 'tweet is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')


      // FAILURE: Post must have hash
      //await decentragram.uploadPost('', 'Post tweet', { from: author }).should.be.rejected;

      // FAILURE: Post must have tweet
      await decentragram.uploadPost('', { from: author }).should.be.rejected;
    })

    //check from Struct
    it('lists posts', async () => {
      const post = await decentragram.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      //assert.equal(post.hash, hash, 'Hash is correct')
      assert.equal(post.tweet, 'Post tweet', 'tweet is correct')
      assert.equal(post.tipAmount, '0', 'tip amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to tip posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await decentragram.tipPostOwner(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      //assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.tweet, 'Post tweet', 'tweet is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipPostOwner
      tipPostOwner = web3.utils.toWei('1', 'Ether')
      tipPostOwner = new web3.utils.BN(tipPostOwner)

      const expectedBalance = oldAuthorBalance.add(tipPostOwner)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await decentragram.tipPostOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })
  })
})