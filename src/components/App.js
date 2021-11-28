import Decentragram from '../abis/Decentragram.json'
import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Decentragram.networks[networkId]
    if(networkData) {
      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
      //console.log(decentragram)
      this.setState({ decentragram })
      const postsCount = await decentragram.methods.postCount().call()
      //console.log(postsCount)
      this.setState({ postsCount })
      // Load posts
      for (var i = 1; i <= postsCount; i++) {
        const post = await decentragram.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post]
        })
      }
      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('Decentragram contract not deployed to detected network.')
    }
  }



  async updateList(){
    //this.setState({ loading: true})
    console.log("Entered")
    console.log(this.state.decentragram)
    const postsCount = await this.state.decentragram.methods.postCount().call()
    console.log(postsCount)
    if(postsCount > this.state.postsCount){
      console.log("enter inside")
      const post = await this.state.decentragram.methods.posts(postsCount).call()
      this.setState({
        posts: [...this.state.posts, post]
      })
      this.setState({
        posts: this.state.posts.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      
      this.setState({ postsCount })
    }
    //this.setState({ loading: false})
  }


  async uploadPost(tweet) {
    this.setState({ loading: true })
    this.state.decentragram.methods.uploadPost(tweet).send({ from: this.state.account }).on('transactionHash', async (hash) => {
      window.location.reload()
    })

  }

  tipPostOwner(id, tipAmount) {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipPostOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      
      window.location.reload()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      posts: [],
      loading: true,
      postCount: 0
    }

    this.uploadPost = this.uploadPost.bind(this)
    this.tipPostOwner = this.tipPostOwner.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              posts={this.state.posts}
              uploadPost={this.uploadPost}
              tipPostOwner={this.tipPostOwner}
            />
        }
      </div>
    );
  }
}

export default App;